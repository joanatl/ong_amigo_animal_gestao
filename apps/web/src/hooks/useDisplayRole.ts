'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'amigo_animal_display_role'

export function useDisplayRole() {
  const [displayRole, setDisplayRoleState] = useState<string>('')

  useEffect(() => {
    setDisplayRoleState(localStorage.getItem(STORAGE_KEY) ?? '')
  }, [])

  return displayRole
}

export function useDisplayRoleControls() {
  const [displayRole, setDisplayRoleState] = useState<string>('')

  useEffect(() => {
    setDisplayRoleState(localStorage.getItem(STORAGE_KEY) ?? '')
  }, [])

  function setDisplayRole(value: string) {
    setDisplayRoleState(value)
    if (value) {
      localStorage.setItem(STORAGE_KEY, value)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return { displayRole, setDisplayRole }
}
