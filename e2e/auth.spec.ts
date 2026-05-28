import { test, expect } from '@playwright/test'

const TEST_USER = {
  name: 'Joana Teste',
  email: `joana_${Date.now()}@amigoanimal.org`,
  password: 'Senha@1234',
}

test.describe('Autenticação', () => {
  test('página de cadastro renderiza corretamente', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
    await expect(page.getByLabel('Nome')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
  })

  test('cadastro com dados válidos redireciona para /animals', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Nome').fill(TEST_USER.name)
    await page.getByLabel('E-mail').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL('/animals', { timeout: 10_000 })
    // Navbar deve mostrar o nome do usuário
    await expect(page.getByText(TEST_USER.name)).toBeVisible()
  })

  test('login com credenciais válidas funciona', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL('/animals', { timeout: 10_000 })
  })

  test('login com senha errada exibe erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(TEST_USER.email)
    await page.getByLabel('Senha').fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('validação de formulário: campos obrigatórios', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Criar conta' }).click()

    // Zod deve disparar erros de validação
    await expect(page.getByText(/pelo menos 2 caracteres/i)).toBeVisible()
  })
})
