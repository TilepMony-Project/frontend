declare module "react-gtm-module" {
  type DataLayerObject = Record<string, unknown>;

  type InitializeArgs = {
    gtmId: string;
    events?: DataLayerObject;
    dataLayerName?: string;
    auth?: string;
    preview?: string;
    dataLayer?: DataLayerObject;
  };

  type DataLayerArgs = {
    dataLayer: DataLayerObject;
    dataLayerName?: string;
  };

  const TagManager: {
    initialize: (options: InitializeArgs) => void;
    dataLayer: (options: DataLayerArgs) => void;
  };

  export default TagManager;
}
