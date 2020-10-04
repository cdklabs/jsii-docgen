import * as jsiiReflect from 'jsii-reflect';
import { JsiiEntity } from './page';

export function elementAnchorLink(type: JsiiEntity | jsiiReflect.Callable) {

  return `#${elementAnchorId(type)}`;
}

export function elementAnchorId(type: JsiiEntity | jsiiReflect.Callable) {
  let sig;
  if (type instanceof jsiiReflect.Callable || type instanceof jsiiReflect.Property) {
    sig = type.parentType.fqn + '.' + type.name;
  } else {
    sig = type.fqn;
  }

  return sig
    .replace(/[^a-z-0-9]/gi, '-')
    .toLocaleLowerCase()
    .split('-')
    .filter(x => x)
    .join('-');
}

export function elementAnchor(type: JsiiEntity | jsiiReflect.Callable) {
  return `<a id="${elementAnchorId(type)}"></a>`;
}
