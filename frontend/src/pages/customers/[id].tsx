import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { customerApi } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  totalSpend: number
  visits: number
  tags: string
  lastOrderAt: string
}

interface Customer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  totalSpend: number
  visits: number
  tags: string | string[]
  lastOrderAt: string
}

export default function EditCustomer() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<CustomerFormData>()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔐 Customer Edit: User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load customer data
  useEffect(() => {
    if (isAuthenticated && id) {
      loadCustomer()
    }
  }, [isAuthenticated, id])

  const loadCustomer = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading customer with ID:', id)
      
      const response = await customerApi.getById(id as string)
      console.log('✅ Customer API response:', response)
      
      // Extract customer data from nested API response
      let customerData: Customer
      if (response.data && response.data.success && response.data.data) {
        customerData = response.data.data
      } else if (response.data) {
        customerData = response.data
      } else {
        throw new Error('Invalid response format')
      }

      console.log('📋 Customer data loaded:', customerData)
      console.log('Loaded record:', customerData)
      setCustomer(customerData)

      // Format data for form
      const formattedData: CustomerFormData = {
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        totalSpend: customerData.totalSpend || 0,
        visits: customerData.visits || 0,
        tags: Array.isArray(customerData.tags) 
          ? customerData.tags.join(', ') 
          : customerData.tags || '',
        lastOrderAt: customerData.lastOrderAt 
          ? new Date(customerData.lastOrderAt).toISOString().split('T')[0]
          : ''
      }

      console.log('📝 Formatted data for form:', formattedData)
      
      // Reset form with customer data
      reset(formattedData)
      
    } catch (error: any) {
      console.error('❌ Error loading customer:', error)
      setError(`Failed to load customer: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CustomerFormData) => {
    if (!id) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('💾 Updating customer with data:', data)
      
      // Format data for API
      const updateData = {
        ...data,
        totalSpend: Number(data.totalSpend),
        visits: Number(data.visits),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        lastOrderAt: data.lastOrderAt ? new Date(data.lastOrderAt).toISOString() : null
      }

      console.log('📤 Sending update data:', updateData)
      
      await customerApi.update(id as string, updateData)
      
      setSuccess(true)
      console.log('✅ Customer updated successfully')
      
      // Redirect to customers list after 2 seconds
      setTimeout(() => {
        router.push('/customers')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Error updating customer:', error)
      setError(`Failed to update customer: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }


  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to edit customers.</p>
          <SmoothButton onClick={() => router.push('/')} variant="primary">
            Go to Dashboard
          </SmoothButton>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Edit Customer - Xeno CRM</title>
        <meta name="description" content="Edit customer information" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <AuthNavigation currentPath={router.pathname} />

        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Link 
                    href="/customers" 
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Customers
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
                <p className="mt-2 text-gray-600">Update customer information and details</p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Customer updated successfully!</h3>
                      <p className="mt-1 text-sm text-green-700">Redirecting to customers list...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Total Spend */}
                  <div>
                    <label htmlFor="totalSpend" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Spend ($) *
                    </label>
                    <input
                      type="number"
                      id="totalSpend"
                      step="0.01"
                      {...register('totalSpend', { 
                        valueAsNumber: true,
                        required: 'Total spend is required',
                        min: { value: 0, message: 'Total spend must be 0 or greater' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter total amount spent"
                    />
                    {errors.totalSpend && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalSpend.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Total amount spent by this customer</p>
                  </div>

                  {/* Visits */}
                  <div>
                    <label htmlFor="visits" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Visits
                    </label>
                    <input
                      type="number"
                      id="visits"
                      {...register('visits', { 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Visits must be 0 or greater' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter number of visits"
                    />
                    {errors.visits && (
                      <p className="mt-1 text-sm text-red-600">{errors.visits.message}</p>
                    )}
                  </div>

                  {/* Last Order Date */}
                  <div>
                    <label htmlFor="lastOrderAt" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Order Date
                    </label>
                    <input
                      type="date"
                      id="lastOrderAt"
                      {...register('lastOrderAt')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <textarea
                      id="tags"
                      rows={3}
                      {...register('tags')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tags (comma-separated)"
                    />
                    <p className="mt-1 text-sm text-gray-500">Separate multiple tags with commas</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <Link href="/customers">
                    <SmoothButton type="button" variant="secondary">
                      Cancel
                    </SmoothButton>
                  </Link>
                  <SmoothButton 
                    type="submit" 
                    variant="primary"
                    loading={isSubmitting || loading}
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Updating...' : 'Update Customer'}
                  </SmoothButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}