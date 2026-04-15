"use client"

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  timestamp: string
}

export function useSSENotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream')
    
    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setIsConnected(true)
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      setIsConnected(false)
      eventSource.close()
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'connected') {
          console.log('Connected to notification stream')
        }
      } catch (e) {
        // Heartbeat messages are not JSON
      }
    }
    
    // Listen for custom notification events
    const handleCustomNotification = (event: CustomEvent) => {
      const notification = event.detail
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      
      // Show browser notification if supported
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }
    
    window.addEventListener('notification', handleCustomNotification as EventListener)
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => {
      eventSource.close()
      window.removeEventListener('notification', handleCustomNotification as EventListener)
    }
  }, [])
  
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50))
    window.dispatchEvent(new CustomEvent('notification', { detail: notification }))
  }
  
  return { notifications, addNotification, isConnected }
}
