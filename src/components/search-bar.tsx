"use client";

import { FetchedDomainInfo } from "@/app/api/domain-info/[domain]/route";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { cn } from "@/utils/common";
import {
  LOADER_IDS,
  LoaderName,
  PROGRAM_INFO_BY_ID,
  SPECIAL_IDS,
  SYSVAR_IDS,
} from "@/utils/programs";
import { searchTokens } from "@/utils/token-search";
import bs58 from "bs58";
import clsx from "clsx";
import {
  Clock,
  RotateCwSquare,
  Search,
  SquareAsterisk,
  SquareCode,
  SquareGanttChart,
  SquareUser,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useId } from "react";
import {
  ActionMeta,
  ControlProps,
  InputActionMeta,
  OnChangeValue,
  OptionProps,
  SelectInstance,
  components,
} from "react-select";
import AsyncSelect from "react-select/async";

import { TokenList } from "@/schemas/tokenList";

import { useGetTokenListVerified } from "@/hooks/jupiterTokenList";
import useLocalStorage from "@/hooks/useLocalStorage";

interface SearchOptions {
  label: string;
  value: string[];
  pathname: string;
  icon: JSX.Element;
  address?: string;
  symbol?: string;
  recentSearch?: boolean;
  verified?: boolean;
}

interface GroupedOption {
  readonly label: string;
  readonly options: readonly SearchOptions[];
}

const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

const hasAnsDomainSyntax = (value: string) => {
  return (
    value.length > 4 &&
    value.substring(value.length - 4) !== ".sol" &&
    value.includes(".")
  );
};

export function SearchBar({ autoFocus = true }: { autoFocus?: boolean }) {
  const asyncRef = React.useRef<SelectInstance<SearchOptions> | null>(null);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const { cluster } = useCluster();
  const { data: verifiedTokens } = useGetTokenListVerified();

  const searchParams = useSearchParams();
  const [isClient, setIsClient] = React.useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<SearchOptions[]>(
    "recentSearchesV2",
    [],
  );

  const onChange = (
    option: OnChangeValue<SearchOptions, false>,
    meta: ActionMeta<SearchOptions>,
  ) => {
    if (meta.action === "select-option") {
      // Update recent searches
      setRecentSearches((prevSearches) => {
        return [
          option as SearchOptions,
          ...prevSearches.filter((item) => item.pathname !== option?.pathname),
        ].slice(0, 5); // Limit to 5 recent searches
      });

      const nextQueryString = searchParams?.toString();
      router.push(
        `${option?.pathname}${nextQueryString ? `?${nextQueryString}` : ""}`,
      );
      setSearch("");
    }
  };

  const onInputChange = (value: string, { action }: InputActionMeta) => {
    if (action === "input-change") {
      setSearch(value);
    }
  };

  function buildRecentSearchesOptions(
    search: string,
    isClient: boolean,
  ): GroupedOption | undefined {
    // Only show recent when client is available to prevent hydration errors
    if (!isClient) return;

    const matchedRecentSearches = recentSearches.filter(
      (recentSearch) =>
        search.length === 0 ||
        recentSearch.label.toLowerCase().includes(search.toLowerCase()),
    );

    if (matchedRecentSearches.length > 0) {
      return {
        label: "Recent Searches",
        options: matchedRecentSearches.map((recentSearch) => ({
          label: recentSearch.label,
          pathname: recentSearch.pathname,
          value: recentSearch.value,
          icon: <Clock strokeWidth={0.5} className="h-8 w-8" />,
          recentSearch: true,
        })),
      };
    }
  }

  async function performSearch(search: string): Promise<GroupedOption[]> {
    search = search.trim();
  
    const recentSearchesOptions = buildRecentSearchesOptions(search, isClient);
    const localOptions = buildOptions(search, cluster);
  
    // Use Promise.all to fetch data in parallel
    try {
      const [tokenOptions, domainOptions, ansDomainOptions] = await Promise.all([
        buildTokenOptions(search, cluster, verifiedTokens!),
        hasDomainSyntax(search) && cluster === Cluster.MainnetBeta
          ? buildDomainOptions(search)
          : Promise.resolve([]), // Resolve to empty array if the condition is false
        hasAnsDomainSyntax(search) && cluster === Cluster.MainnetBeta
          ? buildAnsDomainOptions(search)
          : Promise.resolve([]), // Resolve to empty array if the condition is false
      ]);
  
      const recentSearchesOptionsAppendable = recentSearchesOptions
        ? [recentSearchesOptions]
        : [];
      const tokenOptionsAppendable = tokenOptions ? [tokenOptions] : [];
      const domainOptionsAppendable = domainOptions.length > 0 ? domainOptions : [];
      const ansDomainOptionsAppendable = ansDomainOptions.length > 0 ? ansDomainOptions : [];
  
      return [
        ...recentSearchesOptionsAppendable,
        ...domainOptionsAppendable,
        ...ansDomainOptionsAppendable,
        ...tokenOptionsAppendable,
        ...localOptions,
      ];
    } catch (e) {
      console.error(`Error performing search: ${e instanceof Error ? e.message : e}`);
      return [
        ...(recentSearchesOptions ? [recentSearchesOptions] : []),
        ...localOptions,
      ];
    }
  }  

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        const input = asyncRef.current;
        if (!input) {
          return;
        }

        input.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const controlStyles = {
    base: "bg-muted-background px-4 py-2 shadow-sm transition-colors hover:bg-popover hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12",
    focus: "bg-popover",
    nonFocus: "",
  };

  const placeholderStyles =
    "text-sm font-medium text-muted-foreground whitespace-nowrap overflow-hidden overflow-ellipsis";
  const selectInputStyles = "text-sm font-medium text-muted-foreground";
  const valueContainerStyles = "px-1 cursor-text";
  const singleValueStyles = "leading-7 ml-1";
  const menuStyles =
    "rounded-b-lg border border-t-0 border-input bg-popover overflow-hidden w-full";
  const groupHeadingStyles =
    "ml-2 mt-2 mb-1 text-muted-foreground text-xs font-medium";
  const optionStyles = {
    base: "hover:cursor-pointer px-3 py-2 text-sm w-full",
    focus: "bg-accent",
    selected: "",
  };
  const noOptionsMessageStyles = "py-4 text-sm";
  const loadingMessageStyles = "py-4 text-sm";

  // Get recent searches as default options
  const recentSearchesOptions = buildRecentSearchesOptions("", isClient);
  const defaultOptions = recentSearchesOptions ? [recentSearchesOptions] : [];

  const clearRecentSearch = (pathname: string) => {
    setRecentSearches((prevSearches) =>
      prevSearches.filter((item) => item.pathname !== pathname),
    );
    setTimeout(() => {
      asyncRef?.current?.onInputChange(search, {
        prevInputValue: "",
        action: "set-value",
      });
    });
  };

  const resetValue = "" as any;

  return (
    <AsyncSelect
      ref={asyncRef}
      autoFocus={autoFocus}
      cacheOptions={false}
      // @ts-ignore
      clearRecentSearch={clearRecentSearch}
      defaultOptions={defaultOptions}
      loadOptions={performSearch}
      inputId={useId()}
      instanceId={useId()}
      noOptionsMessage={() => "No results found."}
      loadingMessage={() => "loading..."}
      placeholder="Search for accounts, transactions, tokens and programs..."
      value={resetValue}
      inputValue={search}
      blurInputOnSelect
      openMenuOnFocus
      onChange={onChange}
      onInputChange={onInputChange}
      onMenuClose={() => asyncRef.current?.blur()}
      onFocus={() =>
        asyncRef?.current?.onInputChange(search, {
          prevInputValue: "",
          action: "set-value",
        })
      }
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        Control,
        Option,
      }}
      unstyled
      classNames={{
        control: ({ isFocused }) =>
          clsx(
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base,
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        menu: () => menuStyles,
        groupHeading: () => groupHeadingStyles,
        option: ({ isFocused, isSelected }) =>
          clsx(
            isFocused && optionStyles.focus,
            isSelected && optionStyles.selected,
            optionStyles.base,
          ),
        noOptionsMessage: () => noOptionsMessageStyles,
        loadingMessage: () => loadingMessageStyles,
      }}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          paddingRight: "16px",
        }),
        input: (baseStyles, state) => ({
          ...baseStyles,
          paddingTop: "4px",
          paddingBottom: "4px",
        }),
        menuList: (baseStyles, state) => ({
          ...baseStyles,
          scrollbarWidth: "thin",
        }),
      }}
    />
  );
}

const Control = ({
  children,
  ...props
}: ControlProps<SearchOptions, false>) => (
  <components.Control {...props}>
    <Search className="mr-3 h-5 w-5 text-muted-foreground" />
    {children}
    <button
      className={cn(
        "mr-2 rounded-sm p-1 transition-colors hover:text-red-500",
        props.selectProps.inputValue.length > 0 ? "block" : "hidden",
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={() => {
        props.selectProps.onInputChange("", {
          prevInputValue: "",
          action: "input-change",
        });
      }}
      onTouchStart={() => {
        props.selectProps.onInputChange("", {
          prevInputValue: "",
          action: "input-change",
        });
      }}
    >
      <X className="h-5 w-5" />
    </button>
    <div className="pointer-events-none hidden h-6 w-6 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[14px] text-sm font-medium text-muted-foreground opacity-80 sm:flex">
      {"/"}
    </div>
  </components.Control>
);

const Option = ({ ...props }: OptionProps<SearchOptions, false>) => (
  <components.Option {...props}>
    <span className="flex items-center gap-2">
      <span className="flex-shrink-0">{props.data.icon}</span>
      <span className="flex flex-col overflow-hidden">
        <span className="flex items-center gap-1">
          <span className="truncate">{props.data.label}</span>
          {props.data.symbol && (
            <span className="text-xs text-muted-foreground">
              ({props.data.symbol})
            </span>
          )}
          {props.data.verified && (
            <span className="py-0.8 mb-0.5 ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 text-xs font-medium text-green-800">
              Verified
            </span>
          )}
        </span>
        {props.data.address && (
          <span className="truncate text-xs text-muted-foreground">
            {props.data.address}
          </span>
        )}
      </span>
      {props.data.recentSearch && (
        <button
          className={cn(
            "ml-auto mr-2 rounded-sm p-1 transition-colors hover:text-red-500",
          )}
          onClick={(event) => {
            // @ts-ignore
            props.selectProps.clearRecentSearch(props.data.pathname);
            event.preventDefault();
            event.stopPropagation();
          }}
          onTouchStart={(event) => {
            // @ts-ignore
            props.selectProps.clearRecentSearch(props.data.pathname);
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </span>
  </components.Option>
);

function buildProgramOptions(search: string, cluster: Cluster) {
  const matchedPrograms = Object.entries(PROGRAM_INFO_BY_ID).filter(
    ([address, { name, deployments }]) => {
      if (!deployments.includes(cluster)) return false;
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    },
  );

  if (matchedPrograms.length > 0) {
    return {
      label: "Programs",
      options: matchedPrograms.map(([address, { name }]) => ({
        label: name,
        pathname: "/address/" + address,
        value: [name, address],
        icon: <SquareCode strokeWidth={0.5} className="h-8 w-8" />,
      })),
    };
  }
}

const SEARCHABLE_LOADERS: LoaderName[] = [
  "BPF Loader",
  "BPF Loader 2",
  "BPF Upgradeable Loader",
];

function buildLoaderOptions(search: string) {
  const matchedLoaders = Object.entries(LOADER_IDS).filter(
    ([address, name]) => {
      return (
        SEARCHABLE_LOADERS.includes(name) &&
        (name.toLowerCase().includes(search.toLowerCase()) ||
          address.includes(search))
      );
    },
  );

  if (matchedLoaders.length > 0) {
    return {
      label: "Program Loaders",
      options: matchedLoaders.map(([id, name]) => ({
        label: name,
        pathname: "/address/" + id,
        value: [name, id],
        icon: <RotateCwSquare strokeWidth={0.5} className="h-8 w-8" />,
      })),
    };
  }
}

function buildSysvarOptions(search: string) {
  const matchedSysvars = Object.entries(SYSVAR_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    },
  );

  if (matchedSysvars.length > 0) {
    return {
      label: "Sysvars",
      options: matchedSysvars.map(([id, name]) => ({
        label: name,
        pathname: "/address/" + id,
        value: [name, id],
        icon: <SquareAsterisk strokeWidth={0.5} className="h-8 w-8" />,
      })),
    };
  }
}

function buildSpecialOptions(search: string) {
  const matchedSpecialIds = Object.entries(SPECIAL_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    },
  );

  if (matchedSpecialIds.length > 0) {
    return {
      label: "Accounts",
      options: matchedSpecialIds.map(([id, name]) => ({
        label: name,
        pathname: "/address/" + id,
        value: [name, id],
        icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
      })),
    };
  }
}

async function buildTokenOptions(
  search: string,
  cluster: Cluster,
  verifiedTokens: TokenList,
): Promise<GroupedOption | undefined> {
  const matchedTokens = await searchTokens(search, cluster, verifiedTokens);

  if (matchedTokens.length > 0) {
    // Prioritize tokens with a matching symbol first
    const symbolMatches = matchedTokens.filter(
      (token) => token.symbol.toLowerCase() === search.toLowerCase(),
    );

    // Tokens that match the search term but not the symbol
    const otherMatches = matchedTokens.filter(
      (token) => token.symbol.toLowerCase() !== search.toLowerCase(),
    );

    return {
      label: "Tokens",
      options: [...symbolMatches, ...otherMatches],
    };
  }
}

async function buildDomainOptions(search: string) {
  const domainInfoResponse = await fetch(`/api/domain-info/${search}`);
  const domainInfo = (await domainInfoResponse.json()) as FetchedDomainInfo;

  let returnOptions: GroupedOption[] = [];

  if (domainInfo && domainInfo.owner) {
    returnOptions.push({
      label: "Domains",
      options: [
        {
          label: search,
          pathname: "/address/" + domainInfo.owner,
          value: [search],
          icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
        },
      ],
    });
  }

  return returnOptions;
}

async function buildAnsDomainOptions(search: string) {
  const domainInfoResponse = await fetch(`/api/ans-domain-info/${search}`);
  const domainInfo = (await domainInfoResponse.json()) as FetchedDomainInfo;

  let returnOptions: GroupedOption[] = [];

  if (domainInfo && domainInfo.owner) {
    returnOptions.push({
      label: "Domains",
      options: [
        {
          label: search,
          pathname: "/address/" + domainInfo.owner,
          value: [search],
          icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
        },
      ],
    });
  }

  return returnOptions;
}

// builds local search options
function buildOptions(rawSearch: string, cluster: Cluster) {
  const search = rawSearch.trim();
  if (search.length === 0) return [];

  const options = [];

  const programOptions = buildProgramOptions(search, cluster);
  if (programOptions) {
    options.push(programOptions);
  }

  const loaderOptions = buildLoaderOptions(search);
  if (loaderOptions) {
    options.push(loaderOptions);
  }

  const sysvarOptions = buildSysvarOptions(search);
  if (sysvarOptions) {
    options.push(sysvarOptions);
  }

  const specialOptions = buildSpecialOptions(search);
  if (specialOptions) {
    options.push(specialOptions);
  }

  // Prefer nice suggestions over raw suggestions
  if (options.length > 0) return options;

  try {
    const decoded = bs58.decode(search);
    if (decoded.length === 32) {
      options.push({
        label: "Account",
        options: [
          {
            label: search,
            pathname: "/address/" + search,
            value: [search],
            icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
          },
        ],
      });
    } else if (decoded.length === 64) {
      options.push({
        label: "Transaction",
        options: [
          {
            label: search,
            pathname: "/tx/" + search,
            value: [search],
            icon: <SquareGanttChart strokeWidth={0.5} className="h-8 w-8" />,
          },
        ],
      });
    }
  } catch (err) {
    /* empty */
  }

  return options;
}
