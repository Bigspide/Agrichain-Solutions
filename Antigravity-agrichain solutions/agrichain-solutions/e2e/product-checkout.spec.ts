import { test, expect } from '@playwright/test';

test('Parcourir un produit et passer au checkout mobile‑money', async ({ page }) => {
  // Aller à la page d'accueil
  await page.goto('/');

  // Cliquer sur le premier produit de la liste
  await page.locator('a[data-test="product-link"]').first().click();

  // Vérifier le rendu de la page produit
  await expect(page.locator('h1[data-test="product-name"]')).toBeVisible();

  // Ajouter au panier
  await page.locator('button', { hasText: 'Ajouter au panier' }).click();

  // Aller au panier
  await page.goto('/dashboard/marketplace/cart');

  // Cliquer sur checkout
  await page.locator('button', { hasText: 'Checkout' }).click();

  // Remplir le formulaire mobile‑money
  await page.fill('input[name="phone"]', '+22512345678');
  await page.fill('input[name="amount"]', '5000');
  await page.click('button', { hasText: 'Payer' });

  // Vérifier le retour succès (placeholder)
  await expect(page.locator('text=Paiement en cours')).toBeVisible();
});
