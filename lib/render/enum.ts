import * as jsiiReflect from 'jsii-reflect';
import { Page, RenderContext } from './page';

export class EnumPage extends Page {
  constructor(ctx: RenderContext, private readonly enumType: jsiiReflect.EnumType) {
    super(ctx, enumType, `enum ${enumType.name}`);
  }

  public render() {
    return [
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
