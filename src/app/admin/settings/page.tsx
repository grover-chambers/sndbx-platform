"use client"

import { useState, useEffect } from "react"
import {
  Settings as SettingsIcon, Globe, Mail, Phone, DollarSign,
  Clock, Bell, Users, Shield, CheckCircle, XCircle,
  Plus, Trash2, Save, Loader2, Eye, EyeOff, Key,
  Building2, Calendar, MessageSquare, Lock, Unlock
} from "lucide-react"

type SettingSection = "general" | "approval" | "booking" | "payment" | "notifications" | "features" | "admins"

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState<SettingSection>("general")
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "SNDBX Hub",
    supportEmail: "support@sndbx.com",
    supportPhone: "+254 700 000 000",
    platformUrl: "https://sndbx.com",
    timezone: "Africa/Nairobi",
    dateFormat: "DD/MM/YYYY"
  })

  // Company Approval Settings
  const [approvalSettings, setApprovalSettings] = useState({
    autoApprove: false,
    requireDocuments: true,
    defaultStatus: "PENDING",
    requireVerification: true
  })

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    requireConfirmation: true,
    cancellationWindow: 24,
    maxBookingDuration: 8,
    minBookingNotice: 2,
    allowRecurring: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    commissionRate: 10,
    bookingFee: 5,
    subscriptionFee: 5000,
    mpesaPaybill: "123456",
    mpesaShortcode: "123456",
    currency: "KES"
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    adminNewCompany: true,
    adminNewBooking: true,
    adminNewPayment: true,
    clientEmailNotifications: true,
    companyEmailNotifications: true,
    smsAlerts: false
  })

  // Feature Toggles
  const [featureToggles, setFeatureToggles] = useState({
    clientMessaging: true,
    workspaceBookings: true,
    dealMatching: true,
    publicRegistration: true,
    companyPortal: true,
    clientPortal: true
  })

  // Admin Users
  const [adminUsers, setAdminUsers] = useState([
    { id: "1", email: "admin@sndbx.com", name: "Super Admin", role: "SUPER_ADMIN", lastActive: "2024-03-15" }
  ])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("ADMIN")

  const handleSaveSettings = async () => {
    setLoading(true)
    setSaveMessage(null)
    
    // Simulate save - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSaveMessage({ type: "success", text: "Settings saved successfully!" })
    setTimeout(() => setSaveMessage(null), 3000)
    setLoading(false)
  }

  const addAdmin = () => {
    if (newAdminEmail) {
      setAdminUsers([
        ...adminUsers,
        {
          id: Date.now().toString(),
          email: newAdminEmail,
          name: newAdminEmail.split("@")[0],
          role: newAdminRole,
          lastActive: "Never"
        }
      ])
      setNewAdminEmail("")
    }
  }

  const removeAdmin = (id: string) => {
    setAdminUsers(adminUsers.filter(u => u.id !== id))
  }

  const sections = [
    { id: "general", label: "General", icon: Globe },
    { id: "approval", label: "Company Approval", icon: Building2 },
    { id: "booking", label: "Bookings", icon: Calendar },
    { id: "payment", label: "Payments", icon: DollarSign },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "features", label: "Features", icon: SettingsIcon },
    { id: "admins", label: "Admin Users", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Platform Settings</h1>
          <p className="text-white/80 mt-1 text-sm">Configure platform behavior and control settings</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-white border-r border-slate-200 lg:min-h-screen">
          <div className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as SettingSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    activeSection === section.id
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {saveMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              saveMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {saveMessage.text}
            </div>
          )}

          {/* General Settings */}
          {activeSection === "general" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={generalSettings.platformName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform URL</label>
                    <input
                      type="url"
                      value={generalSettings.platformUrl}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, platformUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                      <option>Africa/Nairobi</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Approval Settings */}
          {activeSection === "approval" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Company Approval Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Auto-approve companies</p>
                    <p className="text-xs text-slate-500">Automatically approve new company registrations</p>
                  </div>
                  <button
                    onClick={() => setApprovalSettings({ ...approvalSettings, autoApprove: !approvalSettings.autoApprove })}
                    className={`relative w-10 h-5 rounded-full transition ${approvalSettings.autoApprove ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${approvalSettings.autoApprove ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Require document upload</p>
                    <p className="text-xs text-slate-500">Companies must upload credentials before approval</p>
                  </div>
                  <button
                    onClick={() => setApprovalSettings({ ...approvalSettings, requireDocuments: !approvalSettings.requireDocuments })}
                    className={`relative w-10 h-5 rounded-full transition ${approvalSettings.requireDocuments ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${approvalSettings.requireDocuments ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Company Status</label>
                  <select
                    value={approvalSettings.defaultStatus}
                    onChange={(e) => setApprovalSettings({ ...approvalSettings, defaultStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="ACTIVE">Active (Auto-approve only)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings */}
          {activeSection === "booking" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Booking Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Require admin confirmation</p>
                    <p className="text-xs text-slate-500">Bookings need admin approval before confirmation</p>
                  </div>
                  <button
                    onClick={() => setBookingSettings({ ...bookingSettings, requireConfirmation: !bookingSettings.requireConfirmation })}
                    className={`relative w-10 h-5 rounded-full transition ${bookingSettings.requireConfirmation ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${bookingSettings.requireConfirmation ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Window (hours)</label>
                    <input
                      type="number"
                      value={bookingSettings.cancellationWindow}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationWindow: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Booking Duration (hours)</label>
                    <input
                      type="number"
                      value={bookingSettings.maxBookingDuration}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, maxBookingDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Booking Notice (hours)</label>
                    <input
                      type="number"
                      value={bookingSettings.minBookingNotice}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, minBookingNotice: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeSection === "payment" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Payment Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      value={paymentSettings.commissionRate}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, commissionRate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Booking Fee (%)</label>
                    <input
                      type="number"
                      value={paymentSettings.bookingFee}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bookingFee: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Subscription Fee (KES)</label>
                    <input
                      type="number"
                      value={paymentSettings.subscriptionFee}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, subscriptionFee: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Paybill Number</label>
                    <input
                      type="text"
                      value={paymentSettings.mpesaPaybill}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, mpesaPaybill: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Notification Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">Admin - New Company Registrations</span>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, adminNewCompany: !notificationSettings.adminNewCompany })}
                    className={`relative w-10 h-5 rounded-full transition ${notificationSettings.adminNewCompany ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${notificationSettings.adminNewCompany ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">Admin - New Bookings</span>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, adminNewBooking: !notificationSettings.adminNewBooking })}
                    className={`relative w-10 h-5 rounded-full transition ${notificationSettings.adminNewBooking ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${notificationSettings.adminNewBooking ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">Admin - New Payments</span>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, adminNewPayment: !notificationSettings.adminNewPayment })}
                    className={`relative w-10 h-5 rounded-full transition ${notificationSettings.adminNewPayment ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${notificationSettings.adminNewPayment ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-700">Client Email Notifications</span>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, clientEmailNotifications: !notificationSettings.clientEmailNotifications })}
                    className={`relative w-10 h-5 rounded-full transition ${notificationSettings.clientEmailNotifications ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${notificationSettings.clientEmailNotifications ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Toggles */}
          {activeSection === "features" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Feature Toggles</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Client Messaging</p>
                    <p className="text-xs text-slate-500">Allow clients to message companies directly</p>
                  </div>
                  <button
                    onClick={() => setFeatureToggles({ ...featureToggles, clientMessaging: !featureToggles.clientMessaging })}
                    className={`relative w-10 h-5 rounded-full transition ${featureToggles.clientMessaging ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${featureToggles.clientMessaging ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Workspace Bookings</p>
                    <p className="text-xs text-slate-500">Enable workspace booking feature</p>
                  </div>
                  <button
                    onClick={() => setFeatureToggles({ ...featureToggles, workspaceBookings: !featureToggles.workspaceBookings })}
                    className={`relative w-10 h-5 rounded-full transition ${featureToggles.workspaceBookings ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${featureToggles.workspaceBookings ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Deal Matching</p>
                    <p className="text-xs text-slate-500">Enable client-company matching feature</p>
                  </div>
                  <button
                    onClick={() => setFeatureToggles({ ...featureToggles, dealMatching: !featureToggles.dealMatching })}
                    className={`relative w-10 h-5 rounded-full transition ${featureToggles.dealMatching ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${featureToggles.dealMatching ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Public Registration</p>
                    <p className="text-xs text-slate-500">Allow public user registration</p>
                  </div>
                  <button
                    onClick={() => setFeatureToggles({ ...featureToggles, publicRegistration: !featureToggles.publicRegistration })}
                    className={`relative w-10 h-5 rounded-full transition ${featureToggles.publicRegistration ? "bg-teal-600" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${featureToggles.publicRegistration ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Users */}
          {activeSection === "admins" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Admin Users</h2>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  <button
                    onClick={addAdmin}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Last Active</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{admin.email}</td>
                        <td className="px-4 py-3 text-slate-600">{admin.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${admin.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{admin.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          {admin.email !== "admin@sndbx.com" && (
                            <button onClick={() => removeAdmin(admin.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-4">Note: Super Admins have full access including managing other admins</p>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
