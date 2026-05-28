import { test, expect } from '@playwright/test'

function uniqueEmail(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}@amigoanimal.org`
}

async function register(page: import('@playwright/test').Page) {
  const email = uniqueEmail('animais')
  await page.goto('/register')
  await page.getByLabel('Nome').fill('Usuario Animais')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill('Senha@1234')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL('/animals')
}

test.describe('Página pública de animais', () => {
  test('exibe a listagem sem login', async ({ page }) => {
    await page.goto('/animals')
    await expect(page.getByRole('heading', { name: 'Animais' })).toBeVisible()
    await expect(page.locator('select').first()).toBeVisible()
    await expect(page.locator('select').nth(1)).toBeVisible()
  })

  test('usuário não autenticado NÃO vê botão "Novo animal"', async ({ page }) => {
    await page.goto('/animals')
    await expect(page.getByRole('link', { name: '+ Novo animal' })).not.toBeVisible()
  })

  test('página inicial exibe animais disponíveis (SSR)', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /animais disponíveis/i })).toBeVisible()
  })
})

test.describe('CRUD de animais (autenticado)', () => {
  // Cada teste usa um usuário único para evitar conflito de e-mail no cadastro
  test.beforeEach(async ({ page }) => {
    await register(page)
  })

  test('usuário autenticado vê botão "Novo animal"', async ({ page }) => {
    await page.goto('/animals')
    await expect(page.getByRole('link', { name: '+ Novo animal' })).toBeVisible()
  })

  test('cria animal com dados válidos', async ({ page }) => {
    const animalName = `Bolinha_${Date.now()}`
    await page.goto('/animals/new')
    await expect(page.getByRole('heading', { name: 'Novo animal' })).toBeVisible()

    await page.getByLabel('Nome *').fill(animalName)
    await page.getByLabel('Idade (meses) *').fill('6')
    await page.getByLabel('Raça').fill('Vira-lata')
    await page.getByLabel('Data de entrada *').fill('2026-01-10')
    await page.getByLabel('Descrição').fill('Cachorro muito dócil')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await page.waitForURL('/animals', { timeout: 10_000 })
    await expect(page.getByText(animalName).first()).toBeVisible()
  })

  test('valida campos obrigatórios ao criar animal', async ({ page }) => {
    await page.goto('/animals/new')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })
})
