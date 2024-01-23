import {
  Long, Double, Int32,
} from 'mongodb';

export default function convertTypeToBsonType(typeOfField, value) {
  switch (typeOfField) {
    case 'long':
      if (String(value).length > 15) return null;
      return new Long(value);
    case 'date':
      return new Date(value);
    case 'double':
      return new Double(value);
    case 'int':
      return new Int32(value);
    case 'bool':
      if (!['false', 'true'].includes(String(value))) {
        return false;
      }
      return Boolean(value);
    case 'string':
      if (value === null) return '';
      return String(value);
    default:
      return null;
  }
}
