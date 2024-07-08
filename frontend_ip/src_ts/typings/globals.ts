type Callback = (...args: any) => void;

type PageTab = {
  tab: string;
  tabLabel: string | Callback;
  hidden: boolean;
};
