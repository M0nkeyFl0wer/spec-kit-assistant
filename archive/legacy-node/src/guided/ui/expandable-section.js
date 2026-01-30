/**
 * ExpandableSection UI Component
 * Provides expand/collapse functionality for advanced options.
 * Implements FR-007 (progressive disclosure pattern)
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

export class ExpandableSection {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique section identifier
   * @param {string} options.collapsedLabel - Label when collapsed (e.g., "Customize...")
   * @param {string} options.expandedLabel - Label when expanded (e.g., "Hide options")
   * @param {string} [options.hint] - Hint text shown when collapsed
   * @param {boolean} [options.defaultExpanded=false] - Initial state
   * @param {Function} [options.renderContent] - Async function to render expanded content
   */
  constructor(options = {}) {
    this.id = options.id;
    this.collapsedLabel = options.collapsedLabel || 'Tell me more...';
    this.expandedLabel = options.expandedLabel || 'Hide details';
    this.hint = options.hint || '';
    this.isExpanded = options.defaultExpanded ?? false;
    this.renderContent = options.renderContent || null;

    this._content = null;
    this._hasRendered = false;
  }

  /**
   * Toggle the expanded state
   * @returns {boolean} New state
   */
  toggle() {
    this.isExpanded = !this.isExpanded;
    return this.isExpanded;
  }

  /**
   * Render the section header (collapsed or expanded indicator)
   * @returns {string}
   */
  renderHeader() {
    const indicator = this.isExpanded ? '▼' : '▶';
    const label = this.isExpanded ? this.expandedLabel : this.collapsedLabel;

    let header = `${indicator} ${label}`;

    if (!this.isExpanded && this.hint) {
      header += chalk.dim(` — ${this.hint}`);
    }

    return chalk.hex('#8B5CF6')(header);
  }

  /**
   * Prompt user to expand/collapse and optionally render content
   * @returns {Promise<Object>} { expanded: boolean, content: any }
   */
  async prompt() {
    // Show the current state
    console.log(this.renderHeader());

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: ' ',
      choices: [
        {
          name: this.isExpanded
            ? chalk.dim('Collapse section')
            : chalk.cyan(this.collapsedLabel),
          value: 'toggle'
        },
        {
          name: chalk.dim('Continue →'),
          value: 'continue'
        }
      ],
      default: 'continue'
    }]);

    if (action === 'toggle') {
      this.toggle();

      if (this.isExpanded && this.renderContent) {
        console.log(chalk.dim('\n─── Advanced Options ───\n'));
        this._content = await this.renderContent();
        this._hasRendered = true;
        console.log(chalk.dim('\n────────────────────────\n'));
      }
    }

    return {
      expanded: this.isExpanded,
      content: this._content
    };
  }

  /**
   * Render the section inline (no prompt, just display)
   * @param {boolean} [showContent=true] - Whether to show content if expanded
   * @returns {Promise<string>}
   */
  async render(showContent = true) {
    let output = this.renderHeader() + '\n';

    if (this.isExpanded && showContent && this.renderContent && !this._hasRendered) {
      output += chalk.dim('─'.repeat(30)) + '\n';
      this._content = await this.renderContent();
      this._hasRendered = true;
      output += chalk.dim('─'.repeat(30)) + '\n';
    }

    return output;
  }

  /**
   * Check if section was expanded and content rendered
   * @returns {boolean}
   */
  wasRendered() {
    return this._hasRendered;
  }

  /**
   * Get the rendered content (if any)
   * @returns {*}
   */
  getContent() {
    return this._content;
  }

  /**
   * Create a "Customize" expandable section
   * @param {string} id
   * @param {Function} renderContent
   * @returns {ExpandableSection}
   */
  static customize(id, renderContent) {
    return new ExpandableSection({
      id,
      collapsedLabel: 'Customize...',
      expandedLabel: 'Hide customization',
      hint: 'Adjust advanced settings',
      renderContent
    });
  }

  /**
   * Create a "Tell me more" expandable section
   * @param {string} id
   * @param {Function} renderContent
   * @returns {ExpandableSection}
   */
  static tellMeMore(id, renderContent) {
    return new ExpandableSection({
      id,
      collapsedLabel: 'Tell me more...',
      expandedLabel: 'Hide details',
      hint: 'Learn about this option',
      renderContent
    });
  }

  /**
   * Create an "Advanced options" expandable section
   * @param {string} id
   * @param {Function} renderContent
   * @returns {ExpandableSection}
   */
  static advanced(id, renderContent) {
    return new ExpandableSection({
      id,
      collapsedLabel: 'Advanced options',
      expandedLabel: 'Hide advanced',
      hint: 'For power users',
      renderContent
    });
  }
}

/**
 * ExpandableSectionGroup
 * Manages a collection of expandable sections
 */
export class ExpandableSectionGroup {
  /**
   * @param {Object} options
   * @param {boolean} [options.accordion=false] - Only one section expanded at a time
   */
  constructor(options = {}) {
    this.sections = new Map();
    this.accordion = options.accordion ?? false;
  }

  /**
   * Add a section to the group
   * @param {ExpandableSection} section
   */
  add(section) {
    this.sections.set(section.id, section);
  }

  /**
   * Get a section by ID
   * @param {string} id
   * @returns {ExpandableSection|null}
   */
  get(id) {
    return this.sections.get(id) || null;
  }

  /**
   * Expand a section (collapses others if accordion mode)
   * @param {string} id
   */
  expand(id) {
    const section = this.sections.get(id);
    if (!section) return;

    if (this.accordion) {
      // Collapse all others
      for (const [otherId, otherSection] of this.sections) {
        if (otherId !== id && otherSection.isExpanded) {
          otherSection.toggle();
        }
      }
    }

    if (!section.isExpanded) {
      section.toggle();
    }
  }

  /**
   * Collapse all sections
   */
  collapseAll() {
    for (const section of this.sections.values()) {
      if (section.isExpanded) {
        section.toggle();
      }
    }
  }

  /**
   * Get all expanded section IDs
   * @returns {string[]}
   */
  getExpanded() {
    const expanded = [];
    for (const [id, section] of this.sections) {
      if (section.isExpanded) {
        expanded.push(id);
      }
    }
    return expanded;
  }
}
