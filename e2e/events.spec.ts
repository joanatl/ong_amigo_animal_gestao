import { test, expect } from '@playwright/test'

function uniqueEmail(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}@amigoanimal.org`
}

async function registerAndLogin(page: import('@playwright/test').Page, email: string) {
  await page.goto('/register')
  await page.getByLabel('Nome').fill('Usuario Teste')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill('Senha@1234')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL('/animals')
}

test.describe('Página pública de eventos', () => {
  test('exibe eventos sem login', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByRole('heading', { name: 'Calendário de Eventos' })).toBeVisible()
  })

  test('usuário não autenticado NÃO vê botão "Novo evento"', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByRole('link', { name: '+ Novo evento' })).not.toBeVisible()
  })
})

test.describe('CRUD de eventos (autenticado)', () => {
  test('cria evento público', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('evt_pub'))
    await page.goto('/events/new')

    const eventTitle = `Feira de Adoção ${Date.now()}`
    await page.getByLabel('Título *').fill(eventTitle)
    await page.getByLabel('Data e hora *').fill('2026-06-15T10:00')
    await page.getByLabel('Local').fill('Parque Ibirapuera')
    await page.getByLabel('Descrição').fill('Venha conhecer nossos animais')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await page.waitForURL('/events', { timeout: 10_000 })
    await expect(page.getByText(eventTitle).first()).toBeVisible()
  })

  test('cria evento privado e só aparece para o criador', async ({ browser }) => {
    const emailA = uniqueEmail('priv_a')
    const emailB = uniqueEmail('priv_b')
    const eventTitle = `Reunião Privada ${Date.now()}`

    // Contexto do Usuário A — cria evento privado
    const ctxA = await browser.newContext()
    const pageA = await ctxA.newPage()
    await registerAndLogin(pageA, emailA)

    await pageA.goto('/events/new')
    await pageA.getByLabel('Título *').fill(eventTitle)
    await pageA.getByLabel('Data e hora *').fill('2026-07-01T09:00')
    await pageA.getByLabel('Visibilidade').selectOption('private')
    await pageA.getByRole('button', { name: 'Salvar' }).click()
    await pageA.waitForURL('/events', { timeout: 10_000 })
    await expect(pageA.getByText(eventTitle).first()).toBeVisible()

    // Contexto do Usuário B — não deve ver o evento privado
    const ctxB = await browser.newContext()
    const pageB = await ctxB.newPage()
    await registerAndLogin(pageB, emailB)
    await pageB.goto('/events')
    await expect(pageB.getByText(eventTitle)).not.toBeVisible()

    await ctxA.close()
    await ctxB.close()
  })

  test('valida campos obrigatórios ao criar evento', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('evt_val'))
    await page.goto('/events/new')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })
})
