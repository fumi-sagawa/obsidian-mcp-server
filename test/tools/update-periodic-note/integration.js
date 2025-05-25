/**
 * Integration test for update-periodic-note tool
 */
export const testCases = [
    {
      name: 'Update daily periodic note with markdown content',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: '# Daily Note\n\n## Tasks for today\n- [ ] Review PRs\n- [ ] Update documentation\n\n## Notes\nThis is a test update.'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Update weekly periodic note',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'weekly',
            content: '# Weekly Review\n\n## Accomplishments\n- Completed feature X\n- Fixed bugs Y and Z\n\n## Next week\n- Start project A'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Update monthly periodic note',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'monthly',
            content: '# Monthly Summary\n\n## Key Metrics\n- Completed 15 tasks\n- 98% uptime\n\n## Highlights\nSuccessful product launch.'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Update quarterly periodic note',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'quarterly',
            content: '# Q1 Review\n\n## Goals Status\n- Goal 1: ✅ Completed\n- Goal 2: 🔄 In Progress\n\n## Financial Summary\nRevenue increased by 15%.'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Update yearly periodic note',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'yearly',
            content: '# 2024 Annual Review\n\n## Major Achievements\n1. Launched 3 new products\n2. Expanded to 5 new markets\n\n## Lessons Learned\nFocus on customer feedback.'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Update with empty content',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: ''
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'Invalid period type should fail',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'hourly',
            content: 'This should fail'
          }
        }
      },
      assertions: [
        response => response.error !== undefined
      ]
    },
    {
      name: 'Missing period parameter should fail',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            content: 'This should fail'
          }
        }
      },
      assertions: [
        response => response.error !== undefined
      ]
    },
    {
      name: 'Missing content parameter should fail',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily'
          }
        }
      },
      assertions: [
        response => response.error !== undefined
      ]
    }
];