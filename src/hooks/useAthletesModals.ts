"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook to manage all modal states for the Athletes page
 * Centralizes 13+ modal visibility toggles for better organization
 */
export function useAthletesModals() {
  // Modal visibility states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditAthleteModal, setShowEditAthleteModal] = useState(false);
  const [showIndividualAssignment, setShowIndividualAssignment] =
    useState(false);
  const [showKPIManagementModal, setShowKPIManagementModal] = useState(false);
  const [showBulkKPIAssignmentModal, setShowBulkKPIAssignmentModal] =
    useState(false);

  // Convenience method to close all modals at once
  const closeAllModals = useCallback(() => {
    setShowInviteModal(false);
    setShowKPIModal(false);
    setShowMessageModal(false);
    setShowBulkModal(false);
    setShowHistoryModal(false);
    setShowAnalyticsModal(false);
    setShowDetailModal(false);
    setShowGroupFormModal(false);
    setShowManageGroupModal(false);
    setShowAddToGroupModal(false);
    setShowEditEmailModal(false);
    setShowEditAthleteModal(false);
    setShowIndividualAssignment(false);
    setShowKPIManagementModal(false);
    setShowBulkKPIAssignmentModal(false);
  }, []);

  return {
    // Modal states
    showInviteModal,
    showKPIModal,
    showMessageModal,
    showBulkModal,
    showHistoryModal,
    showAnalyticsModal,
    showDetailModal,
    showGroupFormModal,
    showManageGroupModal,
    showAddToGroupModal,
    showEditEmailModal,
    showEditAthleteModal,
    showIndividualAssignment,
    showKPIManagementModal,
    showBulkKPIAssignmentModal,

    // Modal setters
    setShowInviteModal,
    setShowKPIModal,
    setShowMessageModal,
    setShowBulkModal,
    setShowHistoryModal,
    setShowAnalyticsModal,
    setShowDetailModal,
    setShowGroupFormModal,
    setShowManageGroupModal,
    setShowAddToGroupModal,
    setShowEditEmailModal,
    setShowEditAthleteModal,
    setShowIndividualAssignment,
    setShowKPIManagementModal,
    setShowBulkKPIAssignmentModal,

    // Utility
    closeAllModals,
  };
}
