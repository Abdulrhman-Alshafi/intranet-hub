import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';
import '@pnp/sp/views';

interface IFieldDefinition {
  title: string;
  internalName: string;
  type: 'Text' | 'Note' | 'Boolean' | 'Number' | 'DateTime' | 'Choice' | 'User' | 'Thumbnail';
  required?: boolean;
  defaultValue?: string;
  choices?: string[];
  richText?: boolean;
}

interface IListDefinition {
  title: string;
  fields: IFieldDefinition[];
}

const LIST_DEFINITIONS: Record<string, IListDefinition> = {
  announcements: {
    title: 'Announcements',
    fields: [
      { title: 'Description', internalName: 'Description', type: 'Note', required: true, richText: true },
      { title: 'Category', internalName: 'Category', type: 'Choice', required: true, choices: ['Company', 'HR', 'IT', 'Facilities', 'Sales', 'Events'] },
      { title: 'Image', internalName: 'Image', type: 'Thumbnail' },
      { title: 'IsPinned', internalName: 'IsPinned', type: 'Boolean', defaultValue: '0' },
      { title: 'IsHidden', internalName: 'IsHidden', type: 'Boolean', defaultValue: '0' },
    ]
  },
  kudos: {
    title: 'Kudos',
    fields: [
      { title: 'Recipient', internalName: 'Recipient', type: 'User', required: true },
      { title: 'GivenBy', internalName: 'GivenBy', type: 'User', required: true },
      { title: 'IsHidden', internalName: 'IsHidden', type: 'Boolean', defaultValue: '0' },
      { title: 'ProfileImage', internalName: 'ProfileImage', type: 'Thumbnail' },
    ]
  },
  kudosLikes: {
    title: 'Kudos Likes',
    fields: [
      { title: 'KudosItemId', internalName: 'KudosItemId', type: 'Number', required: true },
      { title: 'LikedBy', internalName: 'LikedBy', type: 'User', required: true },
    ]
  },
  polls: {
    title: 'Polls',
    fields: [
      { title: 'Options', internalName: 'Options', type: 'Note', required: true },
      { title: 'IsActive', internalName: 'IsActive', type: 'Boolean', defaultValue: '1' },
      { title: 'IsVisible', internalName: 'IsVisible', type: 'Boolean', defaultValue: '1' },
      { title: 'IsLatest', internalName: 'IsLatest', type: 'Boolean', defaultValue: '0' },
      { title: 'TotalVotes', internalName: 'TotalVotes', type: 'Number', defaultValue: '0' },
      { title: 'VotedUsers', internalName: 'VotedUsers', type: 'Note' },
    ]
  },
  events: {
    title: 'Events',
    fields: [
      { title: 'Description', internalName: 'Description', type: 'Note', richText: true },
      { title: 'EventDate', internalName: 'EventDate', type: 'DateTime', required: true },
      { title: 'EndDate', internalName: 'EndDate', type: 'DateTime' },
      { title: 'Location', internalName: 'Location', type: 'Text' },
      { title: 'Category', internalName: 'Category', type: 'Choice', choices: ['Wellness', 'Company', 'Learning', 'Social'] },
      { title: 'Image', internalName: 'Image', type: 'Thumbnail' },
    ]
  },
  employeeOfMonth: {
    title: 'Employee of Month',
    fields: [
      { title: 'Employee', internalName: 'Employee', type: 'User', required: true },
      { title: 'Month', internalName: 'Month', type: 'Text', required: true },
      { title: 'Notes', internalName: 'Notes', type: 'Note' },
    ]
  }
};

export class ListProvisioner {
  private sp: SPFI;

  constructor(sp: SPFI) {
    this.sp = sp;
  }

  public async ensureAllLists(listNameOverrides?: Record<string, string>): Promise<void> {
    const entries = Object.entries(LIST_DEFINITIONS);
    for (const [key, def] of entries) {
      const listTitle = listNameOverrides?.[key] || def.title;
      await this.ensureList(listTitle, def.fields);
    }
  }

  private async ensureList(listTitle: string, fields: IFieldDefinition[]): Promise<void> {
    try {
      // Check if list exists
      await this.sp.web.lists.getByTitle(listTitle)();
    } catch {
      // List does not exist, create it
      try {
        await this.sp.web.lists.add(listTitle, '', 100, false);
      } catch (createErr) {
        console.error(`[ListProvisioner] Failed to create list "${listTitle}":`, createErr);
        return;
      }
    }

    // Ensure all fields exist
    const list = this.sp.web.lists.getByTitle(listTitle);
    for (const field of fields) {
      await this.ensureField(list, field);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async ensureField(list: any, field: IFieldDefinition): Promise<void> {
    try {
      await list.fields.getByInternalNameOrTitle(field.internalName)();
      // Field already exists
      return;
    } catch {
      // Field does not exist, create it
    }

    try {
      switch (field.type) {
        case 'Text':
          await list.fields.addText(field.internalName, { Required: field.required || false });
          break;
        case 'Note':
          await list.fields.addMultilineText(field.internalName, {
            NumberOfLines: 6,
            RichText: field.richText || false,
            Required: field.required || false,
          });
          break;
        case 'Boolean':
          await list.fields.addBoolean(field.internalName);
          break;
        case 'Number':
          await list.fields.addNumber(field.internalName);
          break;
        case 'DateTime':
          await list.fields.addDateTime(field.internalName);
          break;
        case 'Choice':
          await list.fields.addChoice(field.internalName, {
            Choices: field.choices || [],
            Required: field.required || false,
          });
          break;
        case 'User':
          await list.fields.addUser(field.internalName, { Required: field.required || false });
          break;
        case 'Thumbnail':
          // Thumbnail/Image fields are added as text fields that store JSON
          await list.fields.addMultilineText(field.internalName, {
            NumberOfLines: 2,
            RichText: false,
          });
          break;
      }

      // Set the display title if different from internal name
      if (field.title !== field.internalName) {
        const createdField = list.fields.getByInternalNameOrTitle(field.internalName);
        await createdField.update({ Title: field.title });
      }

      // Add the new field to the default view so it is visible in the list UI
      try {
        await list.defaultView.fields.add(field.internalName);
      } catch {
        // Non-fatal: view may already contain the field or view operations not supported
      }
    } catch (err) {
      console.error(`[ListProvisioner] Failed to create field "${field.internalName}":`, err);
    }
  }
}
