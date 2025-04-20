import Joi from 'joi';

export const validateResource = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    type: Joi.string().valid('DOCUMENT', 'APPLICATION', 'DATABASE', 'API', 'SERVICE').required(),
    description: Joi.string().min(10).required(),
    accessLevel: Joi.string().valid('READ', 'WRITE', 'ADMIN', 'NONE').required(),
    teams: Joi.array().items(Joi.string()),
    contextRules: Joi.array().items(
      Joi.object({
        type: Joi.string().required(),
        condition: Joi.string().required(),
        value: Joi.string().required()
      })
    )
  });

  return schema.validate(data);
};