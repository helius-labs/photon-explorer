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

import useLocalStorage from "@/hooks/useLocalStorage";

interface SearchOptions {
  label: string;
  value: string[];
  pathname: string;
  icon: JSX.Element;
  address?: string;
  symbol?: string;
  recent?: boolean;
}

interface GroupedOption {
  readonly label: string;
  readonly options: readonly SearchOptions[];
}

const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

export function SearchBar({ autoFocus = true }: { autoFocus?: boolean }) {
  const asyncRef = React.useRef<SelectInstance<SearchOptions> | null>(null);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const { cluster } = useCluster();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = React.useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<SearchOptions[]>(
    "recentSearches",
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
          ...prevSearches.filter((item) => item?.address !== option?.address),
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
          recent: true,
        })),
      };
    }
  }

  async function performSearch(search: string): Promise<GroupedOption[]> {
    const recentSearchesOptions = buildRecentSearchesOptions(search, isClient);

    const localOptions = buildOptions(search, cluster);
    let tokenOptions;
    try {
      tokenOptions = await buildTokenOptions(search, cluster);
    } catch (e) {
      console.error(
        `Failed to build token options for search: ${e instanceof Error ? e.message : e}`,
      );
    }
    const recentSearchesOptionsAppendable = recentSearchesOptions
      ? [recentSearchesOptions]
      : [];
    const tokenOptionsAppendable = tokenOptions ? [tokenOptions] : [];
    const domainOptions =
      hasDomainSyntax(search) && cluster === Cluster.MainnetBeta
        ? (await buildDomainOptions(search)) ?? []
        : [];

    return [
      ...recentSearchesOptionsAppendable,
      ...localOptions,
      ...tokenOptionsAppendable,
      ...domainOptions,
    ];
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
    base: "border px-4 py-2 border-input shadow-sm transition-colors hover:bg-popover hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12",
    focus: "rounded-t-lg bg-popover",
    nonFocus: "rounded-lg",
  };
  const placeholderStyles =
    "text-sm font-medium text-muted-foreground whitespace-nowrap overflow-hidden overflow-ellipsis";
  const selectInputStyles = "text-sm font-medium text-muted-foreground";
  const valueContainerStyles = "p-1 gap-1";
  const singleValueStyles = "leading-7 ml-1";
  const menuStyles =
    "p-1  rounded-b-lg border border-t-0 border-input bg-popover";
  const groupHeadingStyles =
    "ml-2 mt-2 mb-1 text-muted-foreground text-xs font-medium";
  const optionStyles = {
    base: "hover:cursor-pointer px-3 py-2 rounded-full text-sm",
    focus: "bg-accent",
    selected: "",
  };
  const noOptionsMessageStyles = "py-4 text-sm";
  const loadingMessageStyles = "py-4 text-sm";

  return (
    <AsyncSelect
      ref={asyncRef}
      autoFocus={autoFocus}
      cacheOptions
      defaultOptions
      loadOptions={performSearch}
      inputId={useId()}
      instanceId={useId()}
      noOptionsMessage={() => "No results found."}
      loadingMessage={() => "loading..."}
      placeholder="Search for accounts, transactions, tokens and programs..."
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
        "mr-2 rounded-sm transition-colors hover:text-red-500",
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
      <X className="h-6 w-6" />
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
      <span className="flex flex-col">
        <span className="flex items-center gap-1">
          <span className="truncate">{props.data.label}</span>
          {props.data.symbol && (
            <span className="text-xs text-muted-foreground">
              ({props.data.symbol})
            </span>
          )}
        </span>
        {props.data.address && (
          <span className="truncate text-xs text-muted-foreground">
            {props.data.address}
          </span>
        )}
      </span>
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
): Promise<GroupedOption | undefined> {
  const matchedTokens = await searchTokens(search, cluster);

  if (matchedTokens.length > 0) {
    return {
      label: "Tokens",
      options: matchedTokens,
    };
  }
}

async function buildDomainOptions(search: string) {
  const domainInfoResponse = await fetch(`/api/domain-info/${search}`);
  const domainInfo = (await domainInfoResponse.json()) as FetchedDomainInfo;
  console.log(domainInfo);
  if (domainInfo && domainInfo.owner && domainInfo.address) {
    return [
      {
        label: "Domain Owner",
        options: [
          {
            label: domainInfo.owner,
            pathname: "/address/" + domainInfo.owner,
            value: [search],
            icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
          },
        ],
      },
      {
        label: "Name Service Account",
        options: [
          {
            label: search,
            pathname: "/address/" + domainInfo.address,
            value: [search],
            icon: <SquareUser strokeWidth={0.5} className="h-8 w-8" />,
          },
        ],
      },
    ];
  }
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
