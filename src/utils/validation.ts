import { VALIDATION_RULES } from '../types';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};

export const validateListName = (name: string): { valid: boolean; error?: string } => {
  if (name.length < VALIDATION_RULES.LIST_NAME.MIN_LENGTH) {
    return { valid: false, error: '清单名称不能为空' };
  }
  if (name.length > VALIDATION_RULES.LIST_NAME.MAX_LENGTH) {
    return { valid: false, error: '清单名称不能超过100个字符' };
  }
  if (!VALIDATION_RULES.LIST_NAME.PATTERN.test(name)) {
    return { valid: false, error: '清单名称包含非法字符' };
  }
  return { valid: true };
};

export const validateQuantity = (qty: number): boolean => {
  const numQty = Number(qty);
  return !isNaN(numQty)
    && numQty >= VALIDATION_RULES.QUANTITY.MIN
    && numQty <= VALIDATION_RULES.QUANTITY.MAX;
};

export const validateListDescription = (description: string): boolean => {
  return description.length <= VALIDATION_RULES.LIST_DESCRIPTION.MAX_LENGTH;
};
