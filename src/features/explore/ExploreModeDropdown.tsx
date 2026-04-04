import { IonItem, IonList, IonSpinner, useIonViewWillLeave } from "@ionic/react";
import { useDebouncedValue } from "@mantine/hooks";
import { use, useEffect, useMemo, useState } from "react";
import { CommunityView } from "threadiverse";

import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { getTopAllSearchSort } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { getClient } from "#/services/client";
import { useAppSelector } from "#/store";

import { ExploreModeContext } from "./ExploreModeContext";
import { ExploreMode } from "./ExploreModePicker";

import styles from "./ExploreModeDropdown.module.css";

interface ExploreModeDropdownProps {
  mode: ExploreMode;
}

function looksLikeDomain(query: string): boolean {
  return query.includes(".") && !query.includes(" ") && query.length > 3;
}

export default function ExploreModeDropdown({
  mode,
}: ExploreModeDropdownProps) {
  const { search, searching, setSearching, setSearch } =
    use(ExploreModeContext);
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const knownInstances = useAppSelector(
    (state) => state.instances.knownInstances,
  );
  const [communityResults, setCommunityResults] = useState<CommunityView[]>([]);
  const [validating, setValidating] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 400);

  useEffect(() => {
    if (mode !== "communities" || !debouncedSearch) {
      setCommunityResults([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      const result = await client.search(
        {
          q: debouncedSearch,
          limit: 10,
          type_: "Communities",
          listing_type: "All",
          ...getTopAllSearchSort(await client.getMode()),
        },
        { signal: controller.signal },
      );
      if (!cancelled) setCommunityResults(result.data as CommunityView[]);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedSearch, mode, client]);

  const matchingInstances = useMemo(() => {
    if (
      mode !== "instances" ||
      !search ||
      !knownInstances ||
      knownInstances === "pending"
    )
      return [];

    const all = [...knownInstances.linked, ...(knownInstances.allowed ?? [])];
    const seen = new Set<string>();
    const deduped = all.filter((i) => {
      if (seen.has(i.domain)) return false;
      seen.add(i.domain);
      return true;
    });
    return deduped
      .filter((i) => i.domain.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10);
  }, [mode, search, knownInstances]);

  useIonViewWillLeave(() => {
    setSearching(false);
    setSearch("");
  });

  function close() {
    setSearching(false);
    setSearch("");
  }

  async function browseInstance(domain: string) {
    setValidating(true);
    try {
      await getClient(domain).getSite();
      close();
      router.push(
        `/search/explore/instances/${domain}/communities`,
        "forward",
      );
    } catch {
      // Instance unreachable — keep dropdown open so user can correct the URL
    } finally {
      setValidating(false);
    }
  }

  if (!searching) return null;

  const showModeOptions = !search;
  const showCommunityResults = mode === "communities" && !!search;
  const showInstanceResults = mode === "instances" && !!search;
  const showBrowseOption = mode === "instances" && looksLikeDomain(search);

  return (
    <div className={styles.backdrop} onClick={close} slot="fixed">
      <div className={styles.contents} onClick={(e) => e.stopPropagation()}>
        <IonList>
          {showModeOptions && (
            <>
              <IonItem
                detail={false}
                onClick={() => {
                  close();
                  if (mode !== "communities")
                    router.push("/search/explore", "back");
                }}
              >
                Communities
              </IonItem>
              <IonItem
                detail={false}
                onClick={() => {
                  close();
                  if (mode !== "instances")
                    router.push("/search/explore/instances", "forward");
                }}
              >
                Instances
              </IonItem>
            </>
          )}

          {showCommunityResults &&
            communityResults.map((cv) => (
              <IonItem
                key={cv.community.id}
                detail={false}
                onClick={() => {
                  close();
                  router.push(
                    buildGeneralBrowseLink(`/c/${getHandle(cv.community)}`),
                    "forward",
                  );
                }}
              >
                {getHandle(cv.community)}
              </IonItem>
            ))}

          {showInstanceResults &&
            matchingInstances.map((i) => (
              <IonItem
                key={i.domain}
                detail={false}
                onClick={() => {
                  close();
                  router.push(
                    `/search/explore/instances/${i.domain}/communities`,
                    "forward",
                  );
                }}
              >
                {i.domain}
              </IonItem>
            ))}

          {showBrowseOption && (
            <IonItem
              detail={false}
              disabled={validating}
              onClick={() => browseInstance(search.toLowerCase().trim())}
            >
              {validating && <IonSpinner slot="start" />}
              Browse {search}
            </IonItem>
          )}
        </IonList>
      </div>
    </div>
  );
}
