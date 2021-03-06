/* eslint-disable class-methods-use-this */
import { Post, Like } from '../models';
import { statusCodes } from '../constants';

/**
 * @description Feed Controller class
 */
export default class FeedController {
  /**
   * Checks the user
   *
   * @static
   * @param {*} currentUser
   * @param {*} feed
   * @memberof FeedController
   * @returns {object} feed
   */
  static async checkLikes(currentUser, feed) {
    if (currentUser) {
      const likes = await Like.find({ user: currentUser._id })
        .lean()
        .exec();

      feed = feed.map(post => {
        const match = likes.find(like =>
            currentUser._id.equals(like.user) && post._id.equals(like.post),);
        if (match) return { ...post.toObject(), liked: true };
        return post;
      });

      return feed;
    }

    return feed;
  }

  /**
   * Get all feed
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {void} feed
   * @memberof FeedController
   */
  static async getFeed(req, res) {
    const { offset = 0, limit = 20, search, category } = req.query;
    const { currentUser } = req;
    const where = { status: 'active' };
    if (category) {
      where.type = { $regex: `.*${category}.*` };
    }
    if (search) {
      where.$or = [];
      search.split(' ').forEach(val => {
        where.$or.push({ description: { $regex: `.*${val}.*` } });
      });
    }
    let feed = await Post.find(where)
      .select('-__v')
      .populate('author', 'picture username firstName lastName followerCount followedCount country city')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    feed = await FeedController.checkLikes(currentUser, feed);

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      feed,
    });
  }

  /**
   * Get organization feed
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {void} feed
   * @memberof FeedController
   */
  static async getOrganizationsFeed(req, res) {
    const { offset = 0, limit = 20 } = req.query;
    const { currentUser } = req;

    let feed = await Post.find({
      userType: 'organization',
      status: 'active',
    })
      .select('-__v')
      .populate('author', '-_id -__v -password')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    feed = await FeedController.checkLikes(currentUser, feed);

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      feed,
    });
  }
}
