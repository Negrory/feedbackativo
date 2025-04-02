import { AlertCircle } from 'lucide-react';

interface AlertBannerProps {
  title: string;
  description: string;
  vehicles: Array<{
    placa: string;
    modelo: string;
    oficina: string;
    lastUpdate: string;
  }>;
}

export function AlertBanner({ title, description, vehicles }: AlertBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-1" />
        <div>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {description}
          </p>
          {vehicles.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Veículos sem atualização:
              </h4>
              <div className="space-y-2">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.placa} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{vehicle.placa}</span>
                      <span className="text-red-600 dark:text-red-400 mx-2">•</span>
                      <span>{vehicle.modelo}</span>
                    </div>
                    <div className="text-red-600 dark:text-red-400">
                      {vehicle.oficina}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 