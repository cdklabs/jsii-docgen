import jsiiReflect = require('jsii-reflect');
import { flatMap, compareByKeys, isStatic } from './util';
import { Page, RenderContext } from './page';
import { elementAnchorLink, elementAnchor } from './links';

abstract class Base extends Page {
  protected renderProperties(properties: jsiiReflect.Property[], caption: string) {
    const self = this;

    if (properties.length === 0) { return []; }

    properties.sort(compareByKeys(propertyOrder));

    return [
      '',
      this.headingB(caption),
      '',
      'Name | Type | Description ',
      '-----|------|-------------',
      ...properties.map(_propertiesTableLine),
      ''
    ];

    function _propertiesTableLine(property: jsiiReflect.Property) {
      const name = self.renderElementName(property.name);
      let summary = property.docs.summary;

      if (property.optional) {
        summary += '<br/><br/>' + self.renderDefault(property.docs.docs.default);
      }

      return self.tableRow(
        `${property.static ? '*static* ' : ''}${name}${property.optional ? '?' : ''}${self.renderStability(property)}`,
        self.typeReferenceLink(property.type),
        summary,
      );
    }
  }

  protected renderExtends(c: jsiiReflect.ClassType) {
    if (!c.base) { return []; }

    return [
      `**Extends**: ${this.typeLink(c.base)}`,
    ];
  }

  protected renderImplementors(i: jsiiReflect.Type) {
    const hasImplementors = i.isInterfaceType() || (i.isClassType() && i.abstract);
    if (!hasImplementors) { return []; }

    const implementors = i.allImplementations
      .filter(isClassType)
      .filter(x => !x.abstract);

    if (implementors.length === 0) { return []; }

    return [
      `**Implemented by**: ${implementors.map(x => this.typeLink(x)).join(', ')}`,
    ];
  }

  protected renderMethods(methods: jsiiReflect.Callable[], caption = 'Methods') {
    if (methods.length === 0) { return []; }
  
    methods.sort(compareByKeys(methodOrder));

    return [
      this.headingB(caption),
      '',
      'Name | Description',
      '-----|-----',
      ...methods.map(m => this.methodTableLine(m)),
      ``,
      ...methods.map(m => this.methodDetail(m)),
    ];
  }

  private methodTableLine(method: jsiiReflect.Callable) {
    const text = `[${this.renderElementName(method.name + '()')}](${elementAnchorLink(method)})`;
    return this.tableRow(
      `${text}${this.renderStability(method)}`,
      method.docs.summary,
    );
  }

  protected methodDetail(method: jsiiReflect.Callable, includeHeader = true) {
    const keywordArgsType = method.parameters.length > 0 && method.parameters[method.parameters.length -1].type.type;
    const keywordArguments = new Array<string>();
    if (keywordArgsType && keywordArgsType instanceof jsiiReflect.InterfaceType && keywordArgsType.datatype) {
      for (const prop of keywordArgsType.allProperties) {
        const kwarg = [
          `  *`,
          this.renderElementName(prop.name),
          `(${this.typeReferenceLink(prop.type)})`,
          prop.docs.summary ? ` ${prop.docs.summary}` : ' *No description*',
          prop.optional
            ? this.renderDefault(prop.docs.docs.default)
            : ''
        ]
  
        keywordArguments.push(kwarg.join(' '));
      }
    }
  
    return [
      includeHeader ? '\n---' : '',
      includeHeader ? this.headingC(`${this.methodSignature(method)}${this.renderStability(method)} ${elementAnchor(method)}`) : '',
      method.docs.toString(),
      '```',
      `${this.methodSignature(method, { long: true, verbatim: true })}`,
      '```',
      '',
      ...method.parameters.map(p => [
        '*',
        this.renderElementName(p.name),
        `(${this.typeReferenceLink(p.type)})`,
        p.docs.summary ? ` ${p.docs.summary}` : ` *No description*`,
      ].join(' ')),
      ...keywordArguments,
      '',
      ...method instanceof jsiiReflect.Method ? [
        !method.returns.type.void ? '*Returns*' : '',
        !method.returns.type.void ? '* ' + this.typeReferenceLink(method.returns.type) : '',
      ] : [],
      '',
    ].join('\n');
  }


  /**
   * Find all public static methods that can produce a type like this
   *
   * Only if the producing type is not the type itself.
   */
  protected renderFactories(c: jsiiReflect.ReferenceType) {
    // Only for non-instantiable types
    if (c.isClassType() && !c.abstract) { return []; }

    const allStaticMethods = flatMap(c.system.classes, x => x.ownMethods);
    const factories = allStaticMethods
      .filter(m => m.returns.type.fqn === c.fqn)
      .filter(m => m.parentType !== c);

    if (factories.length === 0) { return []; }

    return [
      `**Obtainable from**: ${factories.map(x => this.methodLink(x)).join(', ')}`,
    ];
  }
}

export class ClassPage extends Base {
  constructor(ctx: RenderContext, private readonly klass: jsiiReflect.ClassType) {
    super(ctx, klass, `class ${klass.name}`);
  }

  public render() {
    const klass = this.klass;

    return [
      klass.docs.toString(),
      '',
      ...this.renderImplements(klass),
      ...this.renderExtends(klass),
      ...this.renderImplementors(klass),
      ...this.renderFactories(klass),
      '',
      ...this.renderConstructor(klass),
      ...this.renderProperties(klass.allProperties.filter(documentableProperty), 'Properties'),
      ...this.renderMethods(classMethods(klass).filter(documentableMethod)),
    ];
  }

  private renderConstructor(obj: jsiiReflect.ClassType): string[] {
    const initializer = obj.initializer;
    if (!initializer) { return []; }

    return [
      this.headingB('Initializer'),
      this.methodDetail(initializer, false),
    ];
  }

  private renderImplements(c: jsiiReflect.ClassType) {
    const ifaces = c.getInterfaces(true);
    if (ifaces.length === 0) { return []; }

    return [
      `**Implements**: ${ifaces.map(x => this.typeLink(x)).join(', ')}`,
    ];
  }

}

export class InterfacePage extends Base {
  private readonly iface: jsiiReflect.InterfaceType;

  constructor(ctx: RenderContext, iface: jsiiReflect.InterfaceType) {
    const kind = iface.datatype ? 'struct' : 'interface';
    super(ctx, iface, `${kind} ${iface.name}`);
    this.iface = iface;
  }

  public render() {
    const iface = this.iface;

    return [
      ...this.renderImplementors(iface),
      ...this.renderFactories(iface),
      '',
      iface.docs.toString(),
      ...this.renderProperties(iface.allProperties.filter(documentableProperty), iface.datatype ? '' : 'Properties'),
      ...this.renderMethods(iface.allMethods.filter(documentableMethod)),
    ];
  }
}



function documentableProperty(p: jsiiReflect.Property) {
  // Don't show methods starting with _, or protected members on subclasses
  return !p.name.startsWith('_') && publicOrDefinedHere(p);
}

function documentableMethod(p: jsiiReflect.Callable) {
  // Don't show methods starting with _, or protected members on subclasses
  return !p.name.startsWith('_') && publicOrDefinedHere(p);
}

/**
 * Return true if the method is a regular public method, or if it's defined on this class
 *
 * Shows public callables on subclasses, but hides protected and statics on subclasses.
 */
function publicOrDefinedHere(p: jsiiReflect.Callable | jsiiReflect.Property) {
  if (p instanceof jsiiReflect.Initializer) { return true; }

  if (p instanceof jsiiReflect.Method || p instanceof jsiiReflect.Property) {
    return (!p.protected && !p.static) || p.definingType === p.parentType;
  }

  throw new Error(`Unknown callable: ${p}`);
}

function classMethods(c: jsiiReflect.ClassType) {
  return c.allMethods;
}

function isClassType(x: jsiiReflect.Type): x is jsiiReflect.ClassType {
  // Need this function because my TypeScript doesn't propagate the type guard
  // through a method.
  return x.isClassType();
}

function propertyOrder(x: jsiiReflect.Property): any[] {
  return [
    x.static ? 1 : 0,
    x.optional ? 1 : 0,
    x.name
  ];
}

function methodOrder(x: jsiiReflect.Callable): any[] {
  return [
    x instanceof jsiiReflect.Initializer ? 0 : 1,
    isStatic(x) ? 1 : 0,
    x.protected ? 1 : 0,
    x.name
  ];
}
