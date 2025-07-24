import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Home,
  CheckSquare,
  CreditCard,
  BarChart3,
  Upload,
  TrendingUp,
  FileText,
  MessageSquare,
  FolderOpen,
  Calculator,
  FileSpreadsheet,
  Users,
  Settings,
  User
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoneyCollectFilled } from '@ant-design/icons'

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Transactions', url: '/transactions', icon: CreditCard },
  { title: 'Financials', url: '/financials', icon: BarChart3 },
  { title: 'Import', url: '/import', icon: Upload },
  { title: 'Data Analytics', url: '/analytics', icon: TrendingUp }
]

const businessItems = [
  { title: 'Invoice/Quote', url: '/invoice-quote', icon: FileText },
  { title: 'Payroll', url: '/payroll', icon: MoneyCollectFilled },
  { title: 'Projections', url: '/projections', icon: FolderOpen },
  { title: 'Accounting Setup', url: '/accounting', icon: Calculator },
  { title: 'Document Management', url: '/documents', icon: FileSpreadsheet },
  { title: 'Qx Chat', url: '/quant-chat', icon: MessageSquare }
]

const setupItems = [
  { title: 'Personel Setup', url: '/personel-setup', icon: Users },
  { title: 'Profile Setup', url: '/profile-setup', icon: User }
]

export function AppSidebar () {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  // Modified getNavCls to apply more distinct styling for the active tab
  const getNavCls = (active) =>
    `flex items-center w-full px-3 py-2 rounded-md transition-colors duration-200
     ${active
       ? 'bg-blue-600 text-white font-bold shadow-sm' // Stronger active state with blue background
       : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' // Default and hover states
     }`

  return (
    <Sidebar className='border-r'>
      <SidebarHeader className='p-4'>
        <motion.div
          className='flex items-center space-x-2'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>Q</span>
          </div>
          {state === 'expanded' && (
            <div>
              <h1 className='font-bold text-lg'>Quantilytix</h1>
              <p className='text-xs text-muted-foreground'>
                unlocking endless possibilities
              </p>
            </div>
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => getNavCls(isActive)}
                      >
                        <item.icon className='h-4 w-4' />
                        {state === 'expanded' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Business Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index + navigationItems.length) * 0.1 }} // Adjusted delay
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => getNavCls(isActive)}
                      >
                        <item.icon className='h-4 w-4' />
                        {state === 'expanded' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Setup</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {setupItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (index + navigationItems.length + businessItems.length) * 0.1 }} // Adjusted delay
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => getNavCls(isActive)}
                      >
                        <item.icon className='h-4 w-4' />
                        {state === 'expanded' && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4'>
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <User className='h-4 w-4' />
          {state === 'expanded' && <span>Zhou, Helper</span>}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
