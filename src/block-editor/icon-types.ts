import type { Component } from "vue";

export interface BlockEditorIcons {
  slashTextIcon: Component;
  slashHeadingIcon: Component;
  slashBulletListIcon: Component;
  slashOrderedListIcon: Component;
  slashTaskListIcon: Component;
  slashBlockquoteIcon: Component;
  slashCodeBlockIcon: Component;
  slashDividerIcon: Component;
  slashImageIcon: Component;
  slashTableIcon: Component;
  slashVideoIcon: Component;
  searchIcon: Component;
  fallbackIcon: Component;
  dragHandleIcon: Component;
  boldIcon: Component;
  italicIcon: Component;
  underlineIcon: Component;
  strikethroughIcon: Component;
  codeIcon: Component;
  alignLeftIcon: Component;
  alignCenterIcon: Component;
  alignRightIcon: Component;
  linkIcon: Component;
  unlinkIcon: Component;
  checkIcon: Component;
  copyIcon: Component;
  deleteIcon: Component;
  dropdownArrowIcon: Component;
  codeBlockLanguageIcon: Component;
  languageIcons: Record<string, Component>;
}
