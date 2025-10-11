import Image from 'next/image';
import { MarketplaceProject } from '@echo-sprout/types';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend';

type ProjectCardProps = {
  project: MarketplaceProject;
  handleProjectPurchase: (project: MarketplaceProject) => void;
};

export const MarketplaceProjectCard = ({ project, handleProjectPurchase }: ProjectCardProps) => {
  const projectDocuments = useQuery(
    api.documents.getDocumentsByEntity,
    project.id
      ? {
          entityId: project.id,
          entityType: 'project',
        }
      : 'skip'
  );

  const featuredImages =
    projectDocuments?.filter(
      (doc: any) => doc.documentType === 'featured_images'
    ) || [];

  return (
    <>
      <div
        key={project.id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <Image
          src={
            featuredImages && featuredImages[0]?.media?.fileUrl
              ? featuredImages[0]?.media?.fileUrl
              : '/loading.png'
          }
          alt={project.name}
          width={300}
          height={200}
          className={`w-full h-48 bg-gray-200 ${featuredImages && featuredImages[0]?.media?.fileUrl ? 'object-contain' : 'object-cover'}`}
        />
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {project.type}
            </span>
          </div>

          <p className="text-gray-600 mb-2">{project.location}</p>
          <p className="text-sm text-gray-600 mb-4">by {project.creator}</p>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <span className="text-yellow-500">★★★★★</span>
              <span className="ml-1 text-sm text-gray-600">
                ({project.rating})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold text-green-600">
                $ {project.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">per credit</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{project.credits}</p>
              <p className="text-sm text-gray-600">credits available</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleProjectPurchase(project)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Contribute
            </button>
            <a
              href={`/marketplace/${project.id}`}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded text-center hover:bg-gray-400"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
