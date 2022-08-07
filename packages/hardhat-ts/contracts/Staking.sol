// SPDX-License-Identifier: MIT
// Inspired by https://solidity-by-example.org/defi/staking-rewards/
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error TransferFailed();
error NeedsMoreThanZero();

/**
 * @dev Staking contract, allow user to:
 *  - create a pool given the token address
 *  - stake to this pool if user owns some pool tokens
 *  - withdraw the user's stakes
 *  - get the reward
 *
 * The reward calculation is the standard algorithmic one saving the reward per token and the reward per user
 */
contract Staking is ReentrancyGuard {
  IERC20 public rewardToken;

  struct Pool {
    address token;
    address oracle;
    uint256 rewardRate;
    uint256 rewardPerTokenStored;
    uint256 totalSupply;
    uint256 lastUpdateTime;
  }

  struct UserInfoPerPool {
    uint256 userRewardPerTokenPaid;
    uint256 balance;
    uint256 rewards;
  }

  mapping(address => mapping(address => UserInfoPerPool)) internal userInfosPerPool;
  mapping(address => Pool) public pools;

  event Staked(address indexed user, address token, uint256 indexed amount);
  event WithdrewStake(address indexed user, address token, uint256 indexed amount);
  event RewardsClaimed(address indexed user, address token, uint256 indexed amount);
  event PoolCreated(address indexed tokenAddress, address oracle, uint256 _rewardRate, string symbol, string name);

  /**
   * @dev Set the reward token in the constructor
   * @param rewardsToken reward's token address
   */
  constructor(address rewardsToken) {
    rewardToken = IERC20(rewardsToken);
  }

  /**
   * @notice create pool
   * @param _tokenAddress address of the pool's token
   * @param _oracle address of the oracle feed
   * @param _rewardRate reward's rate
   */
  function createPool(
    address _tokenAddress,
    address _oracle,
    uint256 _rewardRate
  ) external {
    require(pools[_tokenAddress].token != _tokenAddress, "pool already exists");
    ERC20 _token = ERC20(_tokenAddress);
    pools[_tokenAddress] = Pool({ token: _tokenAddress, oracle: _oracle, rewardRate: _rewardRate, rewardPerTokenStored: 0, totalSupply: 0, lastUpdateTime: 0 });
    emit PoolCreated(_tokenAddress, _oracle, _rewardRate, _token.symbol(), _token.name());
  }

  /**
   * @notice represents how much a token gets given the time
   * @param _tokenAddress address of the pool's token
   */
  function rewardPerToken(address _tokenAddress) public view returns (uint256) {
    Pool memory _pool = pools[_tokenAddress];
    if (_pool.totalSupply == 0) {
      return _pool.rewardPerTokenStored;
    }
    return _pool.rewardPerTokenStored + (((block.timestamp - _pool.lastUpdateTime) * _pool.rewardRate * 1e18) / _pool.totalSupply);
  }

  /**
     * @notice the user's reward
    * @param account: user's account to look for
    * @param _tokenAddress address of the pool's token

     */
  function earned(address account, address _tokenAddress) public view returns (uint256) {
    UserInfoPerPool storage _userInfoPerPool = userInfosPerPool[account][_tokenAddress];
    return ((_userInfoPerPool.balance * (rewardPerToken(_tokenAddress) - _userInfoPerPool.userRewardPerTokenPaid)) / 1e18) + _userInfoPerPool.rewards;
  }

  /**
   * @notice Deposit tokens into this contract
   * @param amount of the stake
   * @param _tokenAddress address of the pool's token
   */
  function stake(uint256 amount, address _tokenAddress) external updateReward(msg.sender, _tokenAddress) nonReentrant moreThanZero(amount) {
    Pool storage _pool = pools[_tokenAddress];
    UserInfoPerPool storage _userInfoForThisPool = userInfosPerPool[msg.sender][_tokenAddress];
    _pool.totalSupply += amount;
    _userInfoForThisPool.balance += amount;
    emit Staked(msg.sender, _tokenAddress, amount);
    bool success = IERC20(_tokenAddress).transferFrom(msg.sender, address(this), amount);
    if (!success) {
      revert TransferFailed();
    }
  }

  /**
   * @notice Withdraw tokens from this contract
   * @param amount | How much to withdraw
   */
  function withdraw(uint256 amount, address _tokenAddress) external updateReward(msg.sender, _tokenAddress) nonReentrant {
    Pool storage _pool = pools[_tokenAddress];
    UserInfoPerPool storage _userInfoForThisPool = userInfosPerPool[msg.sender][_tokenAddress];

    _pool.totalSupply -= amount;
    _userInfoForThisPool.balance -= amount;
    emit WithdrewStake(msg.sender, _tokenAddress, amount);
    bool success = IERC20(_tokenAddress).transfer(msg.sender, amount);
    if (!success) {
      revert TransferFailed();
    }
  }

  /**
   * @notice User claims their tokens
   * @param _tokenAddress address of the pool's token
   */
  function claimReward(address _tokenAddress) external updateReward(msg.sender, _tokenAddress) nonReentrant {
    UserInfoPerPool storage _userInfoForThisPool = userInfosPerPool[msg.sender][_tokenAddress];
    uint256 rewardFromPool = _userInfoForThisPool.rewards;
    uint256 _price = getTokenEthPrice(_tokenAddress);
    uint256 reward = (_price * rewardFromPool) / (10**18);
    _userInfoForThisPool.rewards = 0;
    emit RewardsClaimed(msg.sender, _tokenAddress, reward);

    bool success = rewardToken.transfer(msg.sender, reward);
    if (!success) {
      revert TransferFailed();
    }
  }

  /********************/
  /* Modifiers Functions */
  /********************/

  /**
   * @notice Update reward calculation
   * @param account user's account to look for
   * @param _tokenAddress address of the pool's token
   */
  modifier updateReward(address account, address _tokenAddress) {
    Pool storage _pool = pools[_tokenAddress];
    UserInfoPerPool storage _userInfoForThisPool = userInfosPerPool[msg.sender][_tokenAddress];
    _pool.rewardPerTokenStored = rewardPerToken(_tokenAddress);
    _pool.lastUpdateTime = block.timestamp;
    _userInfoForThisPool.rewards = earned(account, _tokenAddress);
    _userInfoForThisPool.userRewardPerTokenPaid = _pool.rewardPerTokenStored;
    _;
  }

  /**
   * @notice get token price for the reward to be relevant across the pools
   * @param _tokenAddress address of the pool's token
   */
  function getTokenEthPrice(address _tokenAddress) public view returns (uint256) {
    AggregatorV3Interface priceFeed = AggregatorV3Interface(pools[_tokenAddress].oracle);
    (uint80 roundID, int256 price, uint256 startedAt, uint256 timeStamp, uint80 answeredInRound) = priceFeed.latestRoundData();
    return uint256(price);
  }

  modifier moreThanZero(uint256 amount) {
    if (amount == 0) {
      revert NeedsMoreThanZero();
    }
    _;
  }

  /********************/
  /* Frontend Functions */
  /********************/

  function getPool(address _tokenAddress) external view returns (Pool memory) {
    return pools[_tokenAddress];
  }

  function getUserInfoPerPool(address _tokenAddress) external view returns (UserInfoPerPool memory) {
    return userInfosPerPool[msg.sender][_tokenAddress];
  }
}
