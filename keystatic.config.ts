import { config, fields, collection } from '@keystatic/core';

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: 'isamu-takemoto/rjblog',
          branchPrefix: 'keystatic/',
        }
      : {
          kind: 'local',
        },
  collections: {
    blog: collection({
      label: 'ブログ記事',
      slugField: 'slug',
      columns: ['title', 'pubDate'],
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      previewUrl: process.env.NODE_ENV === 'production'
        ? 'https://rjblog-gamma.vercel.app/blog/{slug}'
        : '/blog/{slug}',
      schema: {
        slug: fields.text({
          label: 'スラグ（URL）',
          defaultValue: (() => {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}-1`;
          })(),
        }),
        title: fields.text({ label: 'タイトル' }),
        description: fields.text({ label: '説明', multiline: true }),
        pubDate: fields.date({ label: '公開日' }),
        updatedDate: fields.date({ label: '更新日', validation: { isRequired: false } }),
        draft: fields.checkbox({ label: '下書き', defaultValue: true }),
        tags: fields.array(fields.text({ label: 'タグ' }), {
          label: 'タグ',
          itemLabel: (props) => props.value,
        }),
        content: fields.mdx({
          label: '本文',
          images: {
            directory: 'public/images/blog',
            publicPath: '/images/blog/',
          },
        }),
      },
    }),
  },
});
