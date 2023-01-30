import { body } from 'express-validator';

const validateDataSource = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('You must provide a valid id'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('You must provide a name'),
  body('location.lat')
    .isFloat()
    .withMessage('You must provide a valid latitude'),
  body('location.lng')
    .isFloat()
    .withMessage('You must provide a valid longitude'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('You must provide a valid address'),
  body('type')
    .isIn(['sensor', 'manual'])
    .withMessage('You must provide a valid type'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('You must provide a description'),
  body('metrics')
    .isArray()
    .withMessage('You must provide a valid metrics array'),
  body('expectedFrequencySeconds')
    .isInt()
    .withMessage('You must provide a valid expectedFrequencySeconds'),
  body('expectedFrequencyType')
    .isIn(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'])
    .withMessage('You must provide a valid expectedFrequencyType'),
];

export { validateDataSource };

