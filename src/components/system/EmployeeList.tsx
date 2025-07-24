import React from 'react'
import { Card, Table, Input, Button, Space, Tag, Avatar } from 'antd'
import {
  EditOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { type Employee } from '../../types/payroll'

interface EmployeeListProps {
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
  onSelectEmployee: (employee: Employee | null) => void
  selectedEmployee: Employee | null
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  setEmployees,
  onSelectEmployee,
  selectedEmployee
}) => {
  const [editingKey, setEditingKey] = React.useState<number | null>(null)
  const [editForm, setEditForm] = React.useState<{
    hoursWorked: number
    hourlyRate: number
  }>({
    hoursWorked: 0,
    hourlyRate: 0
  })

  const handleEdit = (employee: Employee) => {
    setEditingKey(Number(employee.id))
    setEditForm({
      hoursWorked: employee.hoursWorked ?? 0,
      hourlyRate:
        typeof employee.hourlyRate === 'number'
          ? employee.hourlyRate
          : parseFloat(employee.hourlyRate as any) || 0
    })
  }

  const handleSave = (id: number) => {
    const updatedEmployees = employees.map(emp =>
      Number(emp.id) === id
        ? {
            ...emp,
            hoursWorked: editForm.hoursWorked,
            hourlyRate: editForm.hourlyRate
          }
        : emp
    )
    setEmployees(updatedEmployees)
    setEditingKey(null)
  }

  const handleCancel = () => {
    setEditingKey(null)
  }

  const safeToFixed = (value: any, fallback = '0.00') => {
    if (typeof value === 'number') return value.toFixed(2)
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed.toFixed(2)
  }

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Employee) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            className='bg-gradient-to-r from-blue-500 to-indigo-500'
          />
          <div>
            <div className='font-semibold'>{text}</div>
            <div className='text-sm text-gray-500'>{record.position}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Payment Type',
      key: 'paymentType',
      render: (_: any, record: Employee) => (
        <Tag color={record.payment_type === 'salary' ? 'blue' : 'orange'}>
          {record.payment_type === 'salary' ? 'Salary' : 'Hourly'}
        </Tag>
      )
    },
    {
      title: 'Rate / Salary',
      key: 'rateOrSalary',
      render: (_: any, record: Employee) => {
        if (record.payment_type === 'salary') {
          return <span>R{safeToFixed(record.base_salary)}</span>
        } else {
          return <span>R{safeToFixed(record.hourly_rate)}</span>
        }
      }
    },
    {
      title: 'Hours Worked',
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (value: number, record: Employee) => {
        if (editingKey === Number(record.id)) {
          return (
            <Input
              type='number'
              value={editForm.hoursWorked}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  hoursWorked: Number(e.target.value)
                }))
              }
              className='w-20'
            />
          )
        }
        return <span>{value ?? 0}h</span>
      }
    },
    {
      title: 'Gross Salary',
      key: 'grossSalary',
      render: (_: any, record: Employee) => {
        const gross =
          record.payment_type === 'salary'
            ? parseFloat(record.base_salary as any) || 0
            : (record.hoursWorked ?? 0) *
              (typeof record.hourlyRate === 'number'
                ? record.hourlyRate
                : parseFloat(record.hourlyRate as any) || 0)
        return <Tag color='green'>R{safeToFixed(gross)}</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => {
        if (editingKey === Number(record.id)) {
          return (
            <Space>
              <Button
                type='primary'
                size='small'
                icon={<CheckOutlined />}
                onClick={() => handleSave(Number(record.id))}
                className='bg-green-500 hover:bg-green-600 border-0'
              />
              <Button
                size='small'
                icon={<CloseOutlined />}
                onClick={handleCancel}
              />
            </Space>
          )
        }
        return (
          <Space>
            <Button
              type='primary'
              size='small'
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className='bg-blue-500 hover:bg-blue-600 border-0'
            />
            <Button
              type='default'
              size='small'
              onClick={() => onSelectEmployee(record)}
              className={
                selectedEmployee?.id === record.id
                  ? 'bg-purple-500 hover:bg-purple-600 text-white border-0'
                  : ''
              }
            >
              {selectedEmployee?.id === record.id ? 'Selected' : 'Select'}
            </Button>
          </Space>
        )
      }
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title='Employee Management'
        className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        <Table
          columns={columns}
          dataSource={employees}
          rowKey='id'
          pagination={false}
          className='custom-table'
          rowClassName={record =>
            selectedEmployee?.id === record.id
              ? 'bg-purple-50 border-purple-200'
              : ''
          }
        />
      </Card>
    </motion.div>
  )
}

export default EmployeeList
