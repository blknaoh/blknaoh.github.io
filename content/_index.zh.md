---
title: ''
date: 2022-10-24
type: landing

sections:
  - block: about.biography
    id: about
    content:
      title: 简介
      username: admin
  - block: collection
    id: posts
    content:
      title: 近期博文
      subtitle: ''
      text: ''
      count: 5
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      offset: 0
      order: desc
    design:
      view: compact
      columns: '2'
  - block: collection
    id: featured
    content:
      title: 代表性论文
      filters:
        folders:
          - publication
        featured_only: true
    design:
      columns: '2'
      view: card
  - block: collection
    content:
      title: 近期论文与专利
      text: |-
        {{% callout note %}}
        可在[论文与专利](./publication/)页面按类型、主题和时间继续浏览。
        {{% /callout %}}
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      columns: '2'
      view: citation
  - block: contact
    id: contact
    content:
      title: 联系方式
      subtitle:
      text:
      email: sjyang@zju.edu.cn
      phone: +86 138 5995 0256
      address:
        street: 平澜路 2118 号 A08-520
        city: 杭州
        region: 浙江
        postcode: '311215'
        country: 中国
        country_code: CN
      coordinates:
        latitude: '30.2636'
        longitude: '120.2993'
      autolink: true
    design:
      columns: '2'
---
