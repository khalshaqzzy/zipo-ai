import { Router, Response } from 'express';
import { authMiddleware, IAuthRequest } from '../middleware/auth';
import { Module } from '../models/Module';
import AdmZip from 'adm-zip';
import { uploadZipo } from '../middleware/multer';
import fs from 'fs';

const router = Router();

// All routes in this file are protected and require authentication.
router.use(authMiddleware);

/**
 * @route   POST /api/modules/import
 * @desc    Imports a .zipo module file.
 * @access  Private
 */
router.post('/import', (req: IAuthRequest, res: Response) => {
    uploadZipo(req, res, async (err: any) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No .zipo file uploaded.' });
        }

        const filePath = req.file.path;

        try {
            const zip = new AdmZip(filePath);
            const zipEntry = zip.getEntry('manifest.json');

            if (!zipEntry) {
                throw new Error('Invalid .zipo file: manifest.json not found.');
            }

            const manifestData = JSON.parse(zipEntry.getData().toString('utf8'));

            const newModule = new Module({
                ...manifestData,
                userId: req.userId, // Associate with the current user
            });

            await newModule.save();

            res.status(201).json(newModule);

        } catch (error) {
            console.error('Error importing module:', error);
            res.status(500).json({ message: 'Failed to import module.' });
        } finally {
            // Clean up the uploaded file
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temporary upload file:', unlinkErr);
                }
            });
        }
    });
});


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
 * @desc    Get a single module's processed commands for playback. The commands already include TTS audio.
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

    // The canvasState already contains the pre-generated audio content.
    // No further processing is needed.
    res.json(module.canvasState || []);

  } catch (error) {
    console.error('Error fetching module for playback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route   GET /api/modules/:id/download
 * @desc    Downloads a module as a .zipo file.
 * @access  Private
 */
router.get('/:id/download', async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const module = await Module.findOne({ _id: id, userId: req.userId });

        if (!module) {
            res.status(404).json({ message: 'Module not found or access denied.' });
            return;
        }

        const zip = new AdmZip();

        // Create a manifest with all necessary module data
        const manifest = {
            title: module.title,
            prompt: module.prompt,
            moduleLength: module.moduleLength,
            language: module.language,
            canvasState: module.canvasState,
            transcript: module.transcript,
            createdAt: module.createdAt,
            updatedAt: module.updatedAt,
        };

        zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)), 'Module manifest');

        const zipBuffer = zip.toBuffer();
        const sanitizedTitle = module.title
            .replace(/\s+/g, '') // Remove all spaces
            .replace(/[^a-z0-9]/gi, ''); // Remove any remaining non-alphanumeric characters

        const fileName = `${sanitizedTitle || 'module'}.zipo`;
        console.log(`[Zipo-Debug] Generated filename for download: "${fileName}"`);

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(zipBuffer);

    } catch (error) {
        console.error('Error downloading module:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;