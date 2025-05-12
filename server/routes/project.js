import express from 'express';
import * as projectController from '../controller/projectController.js';

const router = express.Router();

router.get('/', projectController.getAllProjects);
// router.use(authenticate);

router.get('/:id', projectController.getProjectById);

router.post('/', 
  // authorizeAdmin, 
  projectController.createProject
);

router.put('/:id', 
  // authorizeAdmin,
  // checkPhasePermission('editRoles'), 
  projectController.updateProject
);

router.put('/:id/models',
  // checkPhasePermission('editModels'),
  projectController.updateProjectModels
);

router.get('/:id/documents',
  // checkPhasePermission('viewDocuments'),
  projectController.getProjectDocuments
);

router.delete('/:id', 
  // authorizeAdmin, 
  projectController.deleteProject
);

export default router;