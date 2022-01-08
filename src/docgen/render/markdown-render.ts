import { ApiReferenceSchema, AssemblyMetadataSchema, ClassSchema, ConstructSchema, EnumMemberSchema, EnumSchema, InitializerSchema, InterfaceSchema, JsiiEntity, MethodSchema, ParameterSchema, PropertySchema, StructSchema, TypeSchema } from '../schema';
import { Language } from '../transpile/transpile';
import { MarkdownDocument } from './markdown-doc';

export interface MarkdownFormattingOptions {
  /**
   * How jsii entity IDs should be formatted into anchors. This should be
   * customized in conjunction with `linkFormatter`.
   *
   * @default - use the full id
   */
  readonly anchorFormatter?: (type: JsiiEntity) => string;

  /**
   * How should links to entities be rendered. For example, if a class or a
   * property is referenced within a description or table.
   *
   * @default - '<a href="#{type.id}">{type.displayName}</a>'
   */
  readonly linkFormatter?: (type: JsiiEntity) => string;

  /**
   * How type signatures should be formatted, including those made of nested
   * types (like `Map<string, Bucket>`).
   *
   * @default - HTML code block with type references linked
   * according to `linkFormatter`
   */
  readonly typeFormatter?: (type: TypeSchema, linkFormatter: (type: JsiiEntity) => string) => string;
}

export interface MarkdownRendererOptions extends MarkdownFormattingOptions {
  /**
   * Name of the jsii assembly/package.
   */
  readonly packageName: string;

  /**
   * Version of the jsii assembly/package.
   */
  readonly packageVersion: string;

  /**
   * Name of the submodule this type is from within the jsii assembly (if any).
   */
  readonly submodule?: string;

  /**
   * Language the documentation is rendered for.
   */
  readonly language: Language;
}

export class MarkdownRenderer {
  private readonly anchorFormatter: (type: JsiiEntity) => string;
  private readonly linkFormatter: (type: JsiiEntity) => string;
  private readonly typeFormatter: (type: TypeSchema, linkFormatter: (type: JsiiEntity) => string) => string;
  private readonly metadata: AssemblyMetadataSchema;
  private readonly language: Language;

  constructor(options: MarkdownRendererOptions) {
    this.anchorFormatter = options.anchorFormatter ?? defaultAnchorFormatter;
    this.linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    this.typeFormatter = options.typeFormatter ?? defaultTypeFormatter;
    this.language = options.language;
    this.metadata = {
      packageName: options.packageName,
      packageVersion: options.packageVersion,
      submodule: options.submodule,
    };
  }

  public visitApiReference(
    apiRef: ApiReferenceSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({ header: { title: 'API Reference' }, id: 'api-reference' });
    md.section(this.visitConstructs(apiRef.constructs));
    md.section(this.visitStructs(apiRef.structs));
    md.section(this.visitClasses(apiRef.classes));
    md.section(this.visitInterfaces(apiRef.interfaces));
    md.section(this.visitEnums(apiRef.enums));
    return md;
  }

  public visitConstructs(
    constructs: ConstructSchema[],
  ): MarkdownDocument {
    if (constructs.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Constructs' } });
    for (const construct of constructs) {
      md.section(this.visitConstruct(construct));
    }
    return md;
  }

  public visitStructs(
    structs: StructSchema[],
  ): MarkdownDocument {
    if (structs.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Structs' } });
    for (const struct of structs) {
      md.section(this.visitStruct(struct));
    }
    return md;
  }

  public visitClasses(
    classes: ClassSchema[],
  ): MarkdownDocument {
    if (classes.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Classes' } });
    for (const klass of classes) {
      md.section(this.visitClass(klass));
    }
    return md;
  }

  public visitInterfaces(
    ifaces: InterfaceSchema[],
  ): MarkdownDocument {
    if (ifaces.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Protocols' } });
    for (const iface of ifaces) {
      md.section(this.visitInterface(iface));
    }
    return md;
  }

  public visitEnums(
    enums: EnumSchema[],
  ): MarkdownDocument {
    if (enums.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Enums' } });
    for (const enu of enums) {
      md.section(this.visitEnum(enu));
    }
    return md;
  }

  public visitConstruct(
    construct: ConstructSchema,
  ): MarkdownDocument {
    return this.visitClass(construct);
  }

  public visitStruct(
    struct: StructSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: struct.id,
        displayName: struct.displayName,
        fqn: struct.fqn,
        ...this.metadata,
      }),
      header: { title: struct.displayName },
    });

    if (struct.docs) {
      md.docs(struct.docs);
    }

    const initializer = new MarkdownDocument({
      id: `${struct.id}.Initializer`,
      header: { title: 'Initializer' },
    });

    if (struct.usage) {
      initializer.code(this.language.toString(), struct.usage);
    }

    md.section(initializer);
    md.section(this.visitProperties(struct.properties));
    return md;
  }

  public visitClass(
    klass: ClassSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: klass.id,
        displayName: klass.displayName,
        fqn: klass.fqn,
        ...this.metadata,
      }),
      header: { title: klass.displayName },
    });

    if (klass.interfaces.length > 0) {
      const ifaces = [];
      for (const iface of klass.interfaces) {
        ifaces.push(this.linkFormatter(iface));
      }
      md.bullet(`${MarkdownDocument.italic('Implements:')} ${ifaces.join(', ')}`);
      md.lines('');
    }

    if (klass.docs) {
      md.docs(klass.docs);
    }

    if (klass.initializer) {
      md.section(this.visitInitializer(klass.initializer));
    }

    md.section(this.visitInstanceMethods(klass.instanceMethods));
    md.section(this.visitStaticFunctions(klass.staticMethods));
    md.section(this.visitProperties(klass.properties));
    md.section(this.visitConstants(klass.constants));
    return md;
  }

  public visitInterface(
    iface: InterfaceSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: iface.id,
        displayName: iface.displayName,
        fqn: iface.fqn,
        ...this.metadata,
      }),
      header: { title: iface.displayName },
    });

    if (iface.interfaces.length > 0) {
      const bases = [];
      for (const base of iface.interfaces) {
        bases.push(this.linkFormatter(base));
      }
      md.bullet(`${MarkdownDocument.italic('Extends:')} ${bases.join(', ')}`);
      md.lines('');
    }

    if (iface.implementations.length > 0) {
      const impls = [];
      for (const impl of iface.implementations) {
        impls.push(this.linkFormatter(impl));
      }
      md.bullet(`${MarkdownDocument.italic('Implemented By:')} ${impls.join(', ')}`);
      md.lines('');
    }

    if (iface.docs) {
      md.docs(iface.docs);
    }

    md.section(this.visitInstanceMethods(iface.instanceMethods));
    md.section(this.visitProperties(iface.properties));
    return md;
  }

  public visitEnum(
    enu: EnumSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: enu.id,
        displayName: enu.displayName,
        fqn: enu.fqn,
        ...this.metadata,
      }),
      header: { title: enu.displayName },
    });

    md.table(this.createTable(enu.members));
    md.split();

    if (enu.docs) {
      md.docs(enu.docs);
    }

    for (const em of enu.members) {
      md.section(this.visitEnumMember(em));
    }

    return md;
  }

  public visitProperties(
    properties: PropertySchema[],
  ): MarkdownDocument {
    if (properties.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Properties' } });

    md.table(this.createTableWithTypes(properties));
    md.split();

    for (const prop of properties) {
      md.section(this.visitProperty(prop));
    }

    return md;
  }

  public visitInitializer(
    init: InitializerSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: init.id,
        displayName: init.displayName,
        fqn: init.fqn,
        ...this.metadata,
      }),
      header: {
        title: 'Initializers',
      },
    });

    if (init.usage) {
      md.code(this.language.toString(), init.usage);
    }

    md.table(this.createTableWithTypes(init.parameters));
    md.split();

    for (const param of init.parameters) {
      md.section(this.visitParameter(param));
    }

    return md;
  }

  public visitInstanceMethods(
    methods: MethodSchema[],
  ): MarkdownDocument {
    if (methods.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Methods' } });

    md.table(this.createTable(methods));
    md.split();

    for (const method of methods) {
      md.section(this.visitInstanceMethod(method));
    }
    return md;
  }

  public visitStaticFunctions(
    methods: MethodSchema[],
  ) {
    if (methods.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Static Functions' } });

    md.table(this.createTable(methods));
    md.split();

    for (const method of methods) {
      md.section(this.visitStaticFunction(method));
    }
    return md;
  }

  public visitConstants(
    constants: PropertySchema[],
  ): MarkdownDocument {
    if (constants.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Constants' } });

    md.table(this.createTableWithTypes(constants));
    md.split();

    for (const con of constants) {
      md.section(this.visitConstant(con));
    }

    return md;
  }

  public visitEnumMember(
    em: EnumMemberSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: em.id,
        displayName: em.displayName,
        fqn: em.fqn,
        ...this.metadata,
      }),
      header: {
        title: em.displayName,
        pre: true,
        strike: em.docs.deprecated,
      },
    });

    if (em.docs.deprecated) {
      md.bullet(
        `${MarkdownDocument.italic('Deprecated:')} ${em.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (em.docs) {
      md.docs(em.docs);
    }

    md.split();
    md.lines('');

    return md;
  }

  public visitProperty(
    prop: PropertySchema,
  ): MarkdownDocument {
    const optionality = prop.optional
      ? 'Optional'
      : 'Required';

    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: prop.id,
        displayName: prop.displayName,
        fqn: prop.fqn,
        ...this.metadata,
      }),
      header: {
        title: prop.displayName,
        sup: optionality,
        pre: true,
        strike: prop.docs.deprecated,
      },
    });

    if (prop.docs.deprecated) {
      md.bullet(
        `${MarkdownDocument.italic('Deprecated:')} ${prop.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (prop.usage) {
      md.code(this.language.toString(), prop.usage);
    }

    const metadata: Record<string, string> = {
      Type: this.typeFormatter(prop.type, this.linkFormatter),
    };

    if (prop.default) {
      metadata.Default = MarkdownDocument.sanitize(prop.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${MarkdownDocument.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (prop.docs) {
      md.docs(prop.docs);
    }

    md.split();

    return md;
  }

  public visitParameter(
    parameter: ParameterSchema,
  ): MarkdownDocument {
    const optionality = parameter.optional ? 'Optional' : 'Required';

    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: parameter.id,
        displayName: parameter.displayName,
        fqn: parameter.fqn,
        ...this.metadata,
      }),
      header: {
        title: parameter.displayName,
        sup: optionality,
        pre: true,
        strike: parameter.docs.deprecated,
      },
    });

    if (parameter.docs.deprecated) {
      md.bullet(
        `${MarkdownDocument.italic('Deprecated:')} ${parameter.docs.deprecationReason}`,
      );
      md.lines('');
    }


    const metadata: any = {
      Type: this.typeFormatter(parameter.type, this.linkFormatter),
    };

    if (parameter.default) {
      metadata.Default = MarkdownDocument.sanitize(parameter.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${MarkdownDocument.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (parameter.docs) {
      md.docs(parameter.docs);
    }

    md.split();

    return md;
  }

  public visitInstanceMethod(
    method: MethodSchema,
  ): MarkdownDocument {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: method.id,
        displayName: method.displayName,
        fqn: method.fqn,
        ...this.metadata,
      }),
      header: {
        title: method.displayName,
        pre: true,
        strike: method.docs.deprecated,
      },
    });

    if (method.usage) {
      md.code(this.language.toString(), method.usage);
    }

    for (const param of method.parameters) {
      md.section(this.visitParameter(param));
    }

    return md;
  }

  public visitStaticFunction(
    method: MethodSchema,
  ) {
    const md = new MarkdownDocument({
      id: this.anchorFormatter({
        id: method.id,
        displayName: method.displayName,
        fqn: method.fqn,
        ...this.metadata,
      }),
      header: {
        title: method.displayName,
        pre: true,
        strike: method.docs.deprecated,
      },
    });

    if (method.usage) {
      md.code(this.language.toString(), method.usage);
    }

    for (const param of method.parameters) {
      md.section(this.visitParameter(param));
    }

    return md;
  }

  public visitConstant(
    constant: PropertySchema,
  ): MarkdownDocument {
    return this.visitProperty(constant);
  }

  private createTable(items: SimpleTableItem[]): string[][] {
    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Description'].map(MarkdownDocument.bold));

    for (const item of items) {
      const link = MarkdownDocument.pre(this.linkFormatter({
        fqn: item.fqn,
        displayName: item.displayName,
        id: item.id,
        ...this.metadata,
      }));
      const description = item.docs?.summary && item.docs?.summary.length > 0
        ? item.docs?.summary
        : MarkdownDocument.italic('No description.');
      tableRows.push([link, description]);
    }

    return tableRows;
  }

  private createTableWithTypes(items: TypeTableItem[]): string[][] {
    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Type', 'Description'].map(MarkdownDocument.bold));

    for (const item of items) {
      const link = MarkdownDocument.pre(this.linkFormatter({
        fqn: item.fqn,
        displayName: item.displayName,
        id: item.id,
        ...this.metadata,
      }));
      const type = MarkdownDocument.pre(this.typeFormatter(item.type, this.linkFormatter));
      const description = item.docs?.summary && item.docs?.summary.length > 0
        ? item.docs?.summary
        : MarkdownDocument.italic('No description.');
      tableRows.push([link, type, description]);
    }

    return tableRows;
  }
}

interface SimpleTableItem {
  readonly fqn: string;
  readonly displayName: string;
  readonly id: string;
  readonly docs?: { summary?: string };
}

interface TypeTableItem extends SimpleTableItem {
  readonly type: TypeSchema;
}

export const defaultAnchorFormatter = (type: JsiiEntity) => {
  return type.id;
};

export const defaultLinkFormatter = (type: JsiiEntity) => {
  return `<a href="#${type.id}">${type.displayName}</a>`;
};

function isJsiiType(value: any): value is JsiiEntity {
  return (
    value !== null
    && typeof value === 'object'
    && value?.fqn
    && value?.id
    && value?.displayName
  );
}

export const defaultTypeFormatter = (
  type: TypeSchema,
  linkFormatter: (type: JsiiEntity) => string,
): string => {
  let result = type.formattingPattern;
  const typeRefs = [];
  for (const typeRef of type.types ?? []) {
    if (isJsiiType(typeRef)) {
      typeRefs.push(linkFormatter(typeRef));
    } else {
      typeRefs.push(defaultTypeFormatter(typeRef, linkFormatter));
    }
  }

  // substitute referred types into the original string
  const placeholderMatcher = /\%/g;
  for (const typeRef of typeRefs) {
    const matches = placeholderMatcher.exec(result);
    if (!matches) {
      // it's possible the number of %'s doesn't match the number of types provided
      // e.g. csharp unions are currently rendered to `{ name: 'object', types: [type1, type2] }`
      continue;
    }
    const insertionIdx: number = matches.index;
    result = result.substring(0, insertionIdx) + typeRef + result.substring(insertionIdx + 1);
  }

  return result;
};