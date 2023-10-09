import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router'
import {loadingBar, notification} from "@/main";

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/home',
    meta: {
      title: '首页'
    },
    component: () => import('../views/Index'),
    children: [
      {
        path: 'updateUser',
        name: 'updateUser',
        component: () => import('../views/updateUser-page/Account'),
        meta: {
          title: '信息修改'
        }
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('../views/Home'),
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('../views/calendar-page/Calendar'),
        meta: {
          title: '日历'
        }
      },
      {
        path: 'note-control',
        name: 'note-control',
        redirect: '/note-control/note',
        meta: {
          title: '笔记相关'
        },
        children: [
          {
            path: 'note',
            name: 'note',
            component: () => import('../views/note-page/NoteControl'),
            meta: {
              title: '笔记'
            }
          },
          {
            path: 'note-edit',
            name: 'note-add',
            component: () => import('../views/note-page/AddOrEditNote'),
            meta: {
              title: '笔记新增'
            },
          },
          {
            path: ':id',
            name: 'note-edit',
            component: () => import('../views/note-page/AddOrEditNote'),
            meta: {
              title: '笔记编辑'
            }
          },
        ]
      },
      {
        path: 'time-control',
        name: 'time-control',
        redirect: '/time-control/time',
        meta: {
          title: '时间管理'
        },
        children: [
          {
            path: 'time',
            name: 'time',
            component: () => import('../views/time-page/Time.vue'),
            meta: {
              title: '时间'
            }
          },
        ]
      },
    ]
  },
  {
    path: '/preview/:id',
    name: 'note-preview',
    component: () => import('../views/note-page/NotePreview'),
    meta: {
      title: '笔记预览'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register'),
    meta: {
      title: '注册'
    }
  },
  {
    path: '/404',
    component: () => import('../views/result-page/404'),
    meta: {
      title: '404 Not Found'
    }
  },
  {
    path: '/:path',
    redirect: '/404'
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  loadingBar.start()
  if (to.path !== '/login' && to.path !== '/register') {
    let token = localStorage.getItem('token')
    if (token !== null && token !== undefined && token !== '') {
    } else {
      notification.error({title: '通知', content: '请登录', duration: 5000})
      router.push('/login?to=' + to.path)
    }
  }
  next()
})

router.afterEach((to, from) => {
  // 后置守卫一般用来 优化用户的体验 例如切换路由时更改页面的title
  document.querySelector('title').innerText = to.meta.title + ' - 运维系统'
  loadingBar.finish()
})

export default router
