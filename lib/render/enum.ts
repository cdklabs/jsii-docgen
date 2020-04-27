import jsiiReflect = require('jsii-reflect');
import { Page, RenderContext } from './page';

export class EnumPage extends Page {
  constructor(ctx: RenderContext, private readonly enumType: jsiiReflect.EnumType) {
    super(ctx, enumType);
  }

  public render() {
    const title = `enum ${this.enumType.name}`;

    return [
      `# ${title} ${this.renderStability(this.enumType)}`,
      '',
      this.enumType.docs.toString(),
      '',
      'Name | Description',
      '-----|-----',
      ...this.enumType.members.map(m => this.renderMemberRow(this.enumType, m)),
    ];
  }

  private renderMemberRow(enumType: jsiiReflect.EnumType, member: jsiiReflect.EnumMember) {
    return [
      `**${member.name}** ${this.renderStability(enumType)}`,
      member.docs.summary,
    ].join('|');
  }
}
