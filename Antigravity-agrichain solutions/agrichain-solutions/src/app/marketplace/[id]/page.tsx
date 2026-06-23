import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { getBlockchainAnchor } from '@/lib/blockchain';

export const dynamic = 'force-dynamic'; // always fetch server‑side

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { seller: true },
  });

  if (!product) {
    notFound();
    return null;
  }

  // Récupérer les données de traçabilité depuis la blockchain (placeholder)
  const anchor = await getBlockchainAnchor(product.traceCode);

  return (
    <section className="mx-auto max-w-4xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Image
          src={(product.images as string[])?.[0] ?? '/placeholder.png'}
          alt={product.name}
          width={500}
          height={500}
          className="rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="mb-2">{product.description}</p>
          <p className="text-lg font-semibold mb-4">{product.price} FCFA</p>
          <p className="text-sm text-gray-600 mb-2">Produit par {product.seller.name}</p>
          {anchor && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <h2 className="font-medium">Traçabilité</h2>
              <p>Hash de la transaction : {anchor.txHash || 'En cours de validation'}</p>
              <p>Date : {new Date(anchor.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          <form method="post" action="/api/cart/add">
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Ajouter au panier
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
