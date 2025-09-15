import React, { useState, useEffect } from 'react'
import { segmentApi } from '@/lib/api'
import SmoothButton from './SmoothButton'

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
}

interface SegmentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (segmentId: string, segmentName: string) => void
  campaignName: string
  campaignMessage: string
  loading?: boolean
}

export default function SegmentSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  campaignName, 
  campaignMessage,
  loading = false 
}: SegmentSelectionModalProps) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('')
  const [segmentsLoading, setSegmentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSegments()
    }
  }, [isOpen])

  const loadSegments = async () => {
    setSegmentsLoading(true)
    setError(null)
    try {
      const response = await segmentApi.getAll()
      const segmentsData = response.data.data || response.data
      setSegments(segmentsData)
      
      // Auto-select first segment if available
      if (segmentsData.length > 0) {
        setSelectedSegmentId(segmentsData[0]._id)
      }
    } catch (err: any) {
      console.error('Error loading segments:', err)
      setError('Failed to load segments')
    } finally {
      setSegmentsLoading(false)
    }
  }

  const handleCreate = () => {
    if (selectedSegmentId) {
      const selectedSegment = segments.find(s => s._id === selectedSegmentId)
      onSelect(selectedSegmentId, selectedSegment?.name || 'Unknown Segment')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Target Segment</h2>
              <p className="text-sm text-gray-600 mt-1">Choose which customer segment to target for this AI campaign</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Campaign Preview */}
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Campaign Preview</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-sm text-gray-900">{campaignName}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Message:</span>
              <div className="ml-2 text-sm text-gray-900 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                {campaignMessage}
              </div>
            </div>
          </div>
        </div>

        {/* Segment Selection */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Available Segments</h3>
          
          {segmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading segments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <SmoothButton
                onClick={loadSegments}
                variant="secondary"
                size="sm"
              >
                Retry
              </SmoothButton>
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">No segments available</p>
              <p className="text-xs text-gray-500">Create a segment first to target campaigns</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {segments.map((segment) => (
                <label
                  key={segment._id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    selectedSegmentId === segment._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="segment"
                    value={segment._id}
                    checked={selectedSegmentId === segment._id}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{segment.name}</h4>
                      <span className="text-xs text-gray-500">{segment.customerCount} customers</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{segment.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <SmoothButton
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={loading}
          >
            Cancel
          </SmoothButton>
          <SmoothButton
            onClick={handleCreate}
            variant="primary"
            size="md"
            loading={loading}
            disabled={!selectedSegmentId || segmentsLoading}
          >
            Create Campaign
          </SmoothButton>
        </div>
      </div>
    </div>
  )
}
