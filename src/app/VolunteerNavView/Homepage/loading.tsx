import React from 'react'
import LoadingFallback from '@/app/components/LoadingFallback'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingFallback />
    </div>
  )
}
