import { Router, Response } from 'express';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { Module } from '../models/Module';
import { synthesizeSpeech } from '../services/ttsService';

const router = Router();

// All routes in this file are protected and require authentication.
router.use(authMiddleware);

/**
 * @route   GET /api/modules
 * @desc    Get a list of all modules for the logged-in user.
 * @access  Private
 */
router.get('/', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const modules = await Module.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/modules/:id
 * @desc    Get a single module by ID.
 * @access  Private
 */
router.get('/:id', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const module = await Module.findOne({ _id: id, userId: req.userId });
    if (!module) {
      res.status(404).json({ message: 'Module not found or access denied.' });
      return;
    }
    
    res.json(module);

  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/modules/:id/play
 * @desc    Get a single module's processed commands for playback, including TTS audio.
 * @access  Private
 */
router.get('/:id/play', async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await Module.findOne({ _id: id, userId: req.userId });

    if (!module) {
      res.status(404).json({ message: 'Module not found or access denied.' });
      return;
    }

    // Use the language saved with the module for TTS synthesis.
    const lang = module.language || 'en-US';

    // Process the canvas state to include audio for speak commands
    const processedCommands = await Promise.all(
      (module.canvasState || []).map(async (cmd: any) => {
        if (cmd.command === 'speak' && cmd.payload.text) {
          try {
            const audioContent = await synthesizeSpeech(cmd.payload.text, lang);
            return { ...cmd, payload: { ...cmd.payload, audioContent } };
          } catch (ttsError) {
            console.error(`TTS synthesis failed for module ${id}, command text: "${cmd.payload.text}"`, ttsError);
            // Return the command without audio if TTS fails
            return cmd;
          }
        }
        return cmd;
      })
    );

    res.json(processedCommands);

  } catch (error) {
    console.error('Error fetching module for playback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
