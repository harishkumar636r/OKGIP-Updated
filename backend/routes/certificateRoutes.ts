import { Router } from 'express';
import { getCertificates, verifyCertificate, generateCertificate } from '../controllers/certificateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/verify/:code', verifyCertificate);

router.use(authenticateToken);
router.get('/', getCertificates);
router.post('/generate', generateCertificate);

export default router;
