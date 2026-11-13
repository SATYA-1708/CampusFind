import validator from 'validator';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../models/Item.js';
import { REPORT_REASONS } from '../models/Report.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || validator.isEmpty(name.trim())) {
    errors.push('Full name is required.');
  } else if (!validator.isLength(name.trim(), { min: 2, max: 60 })) {
    errors.push('Name must be between 2 and 60 characters.');
  }

  if (!email || validator.isEmpty(email.trim())) {
    errors.push('Email is required.');
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || validator.isEmpty(password)) {
    errors.push('Password is required.');
  } else if (!validator.isLength(password, { min: 6 })) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  // Prevent client from escalating role through registration body
  delete req.body.role;

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email.trim())) {
    errors.push('Please enter a valid email address.');
  }
  if (!password || validator.isEmpty(password)) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  next();
};

export const validateItem = (req, res, next) => {
  const { type, title, description, category, campusLocation, eventDate } = req.body;
  const errors = [];

  if (!type || !['lost', 'found'].includes(type)) {
    errors.push('Item type must be either "lost" or "found".');
  }

  if (!title || validator.isEmpty(title.trim())) {
    errors.push('Title is required.');
  } else if (!validator.isLength(title.trim(), { min: 3, max: 100 })) {
    errors.push('Title must be between 3 and 100 characters.');
  }

  if (!description || validator.isEmpty(description.trim())) {
    errors.push('Description is required.');
  } else if (!validator.isLength(description.trim(), { min: 5, max: 2000 })) {
    errors.push('Description must be between 5 and 2000 characters.');
  }

  if (!category || !ITEM_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Must be one of: ${ITEM_CATEGORIES.join(', ')}`);
  }

  if (!campusLocation || !CAMPUS_LOCATIONS.includes(campusLocation)) {
    errors.push(`Invalid campus location. Must be one of: ${CAMPUS_LOCATIONS.join(', ')}`);
  }

  if (!eventDate || isNaN(new Date(eventDate).getTime())) {
    errors.push('Valid event date is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  next();
};

export const validateClaim = (req, res, next) => {
  const { explanation } = req.body;
  const errors = [];

  if (!explanation || validator.isEmpty(explanation.trim())) {
    errors.push('Please provide an explanation with identifying proof to substantiate your claim.');
  } else if (!validator.isLength(explanation.trim(), { min: 10, max: 2000 })) {
    errors.push('Explanation must be between 10 and 2000 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  next();
};

export const validateReport = (req, res, next) => {
  const { reason } = req.body;
  const errors = [];

  if (!reason || !REPORT_REASONS.includes(reason)) {
    errors.push(`Invalid report reason. Must be one of: ${REPORT_REASONS.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  next();
};
