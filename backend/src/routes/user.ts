import { Router, Response } from 'express';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// All routes in this file are protected and require authentication.
router.use(authMiddleware);

/**
 * @route   GET /api/user/profile
 * @desc    Fetches the logged-in user's profile information.
 * @access  Private
 */
router.get('/profile', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    // The userId is attached to the request by the authMiddleware
    const user = await User.findById(req.userId).select('username'); // Select only the username

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   POST /api/user/complete-tutorial
 * @desc    Marks the user's tutorial as completed.
 * @access  Private
 */
router.post('/complete-tutorial', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.userId, { hasCompletedTutorial: true });
    res.status(200).json({ message: 'Tutorial marked as completed.' });
  } catch (error) {
    console.error('Error completing tutorial:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
