/**
 * Integration test for update-periodic-note tool
 */
export const updatePeriodicNoteTests = {
  name: 'update_periodic_note',
  tests: [
    {
      name: 'Update daily periodic note with markdown content',
      params: {
        period: 'daily',
        content: '# Daily Note\n\n## Tasks for today\n- [ ] Review PRs\n- [ ] Update documentation\n\n## Notes\nThis is a test update.'
      },
      expectedSuccess: true,
      validate: (result) => {
        if (!result.content || !Array.isArray(result.content)) {
          throw new Error('Expected result.content to be an array');
        }
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated daily periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update weekly periodic note',
      params: {
        period: 'weekly',
        content: '# Weekly Review\n\n## Accomplishments\n- Completed feature X\n- Fixed bugs Y and Z\n\n## Next week\n- Start project A'
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated weekly periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update monthly periodic note',
      params: {
        period: 'monthly',
        content: '# Monthly Summary\n\n## Key Metrics\n- Completed 15 tasks\n- 98% uptime\n\n## Highlights\nSuccessful product launch.'
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated monthly periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update quarterly periodic note',
      params: {
        period: 'quarterly',
        content: '# Q1 Review\n\n## Goals Status\n- Goal 1: ✅ Completed\n- Goal 2: 🔄 In Progress\n\n## Financial Summary\nRevenue increased by 15%.'
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated quarterly periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update yearly periodic note',
      params: {
        period: 'yearly',
        content: '# 2024 Annual Review\n\n## Major Achievements\n1. Launched 3 new products\n2. Expanded to 5 new markets\n\n## Lessons Learned\nFocus on customer feedback.'
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated yearly periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update with empty content',
      params: {
        period: 'daily',
        content: ''
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated daily periodic note')) {
          throw new Error('Should allow empty content');
        }
      }
    },
    {
      name: 'Update with complex markdown',
      params: {
        period: 'daily',
        content: `# Complex Daily Note

## Code Examples

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Tables

| Task | Status | Priority |
|------|--------|----------|
| Review PR | Done | High |
| Write tests | In Progress | Medium |

## Links and Images

- [Documentation](https://docs.example.com)
- ![Screenshot](./images/screenshot.png)

> **Note**: This is a blockquote with **bold** and *italic* text.

### Nested Lists

1. First item
   - Sub-item A
   - Sub-item B
     - Nested item
2. Second item`
      },
      expectedSuccess: true,
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated daily periodic note')) {
          throw new Error('Should handle complex markdown');
        }
      }
    },
    {
      name: 'Invalid period type should fail',
      params: {
        period: 'hourly',
        content: 'This should fail'
      },
      expectedSuccess: false,
      expectedError: 'Validation error'
    },
    {
      name: 'Missing period parameter should fail',
      params: {
        content: 'This should fail'
      },
      expectedSuccess: false,
      expectedError: 'Validation error'
    },
    {
      name: 'Missing content parameter should fail',
      params: {
        period: 'daily'
      },
      expectedSuccess: false,
      expectedError: 'Validation error'
    }
  ]
};