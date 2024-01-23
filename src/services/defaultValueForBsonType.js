import {
  Long, Double, Int32,
} from 'mongodb';

export default function defaultValue(typeOfField) {
  switch (typeOfField) {
    case 'long':
      return new Long(null);
    case 'date':
      return new Date(0);
    case 'double':
      return new Double(null);
    case 'int':
      return new Int32(null);
    case 'bool':
      return false;
    case 'string':
      return '';
    default:
      return null;
  }
}
