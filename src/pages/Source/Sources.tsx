import * as React from "react";
import {
  Button,
  Card,
  debounce,
  PageSection,
  SearchInput,
  Text,
  TextContent,
  TextVariants,
  ToggleGroup,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import EmptyStatus from "../../components/EmptyStatus";
import { useNavigate } from "react-router-dom";
import { Source, fetchData } from "../../apis/apis";
import _ from "lodash";
import { useQuery } from "react-query";
import { API_URL } from "../../utils/constants";
import SourceSinkTable from "../../components/SourceSinkTable";

export interface ISourceProps {
  sampleProp?: string;
}

const Sources: React.FunctionComponent<ISourceProps> = () => {
  const navigate = useNavigate();

  const navigateTo = () => {
    navigate("/source/catalog");
  };

  const [searchResult, setSearchResult] = React.useState<Source[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const onClear = () => {
    onSearch?.("");
  };

  const {
    data: sourcesList = [],
    error,
    isLoading,
  } = useQuery<Source[], Error>(
    "sources",
    () => fetchData<Source[]>(`${API_URL}/api/sources`),
    {
      refetchInterval: 7000,
      onSuccess: (data) => {
        if (searchQuery.length > 0) {
          const filteredSource = _.filter(data, function (o) {
            return o.name.toLowerCase().includes(searchQuery.toLowerCase());
          });
          setSearchResult(filteredSource);
        } else {
          setSearchResult(data);
        }
      },
    }
  );

  const debouncedSearch = React.useCallback(
    debounce((searchQuery: string) => {
      const filteredSource = _.filter(sourcesList, function (o) {
        return o.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setSearchResult(filteredSource);
    }, 700),
    [sourcesList]
  );

  const onSearch = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <>
      <PageSection isWidthLimited>
        <TextContent>
          <Text component="h1">Source</Text>
          {sourcesList.length > 0 ? (
            <Text component="p">
              Add a source to streams change events from a source database. To
              start select a connector below once you select a connector you can
              configure it using form or smart editor option. You can also
              search the connector by its name or toggle the catalog between the
              list view or card view.
            </Text>
          ) : (
            <></>
          )}
        </TextContent>
      </PageSection>
      <PageSection>
        {sourcesList.length > 0 ? (
          <Card style={{ paddingTop: "15px" }}>
            <Toolbar
              id="toolbar-sticky"
              style={{
                marginRight: "1px",
                marginLeft: "1px",
              }}
              className="custom-toolbar"
              isSticky
            >
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    aria-label="Items example search input"
                    placeholder="Find by name"
                    value={searchQuery}
                    onChange={(_event, value) => onSearch(value)}
                    onClear={onClear}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <ToggleGroup aria-label="Icon variant toggle group">
                    <Button
                      variant="primary"
                      icon={<PlusIcon />}
                      onClick={navigateTo}
                    >
                      Add source
                    </Button>
                  </ToggleGroup>
                </ToolbarItem>
                <ToolbarGroup
                  variant="icon-button-group"
                  align={{ default: "alignEnd" }}
                >
                  <ToolbarItem>
                    <Text component={TextVariants.small}>
                      {
                        (searchQuery.length > 0 ? searchResult : sourcesList)
                          .length
                      }{" "}
                      Items
                    </Text>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>

            <SourceSinkTable
              data={searchQuery.length > 0 ? searchResult : sourcesList}
              tableType="source"
              onClear={onClear}
            />
          </Card>
        ) : (
          <EmptyStatus
            heading="No source available"
            primaryMessage=' No source is configure for this cluster yet. To streams change
              events from a source database you can configure a source by click
              the "Add source" button.'
            secondaryMessage="This text has overridden a css component variable to demonstrate
              how to apply customizations using PatternFly's global
              variable API."
            primaryAction={
              <Button
                variant="primary"
                icon={<PlusIcon />}
                onClick={navigateTo}
              >
                Add source
              </Button>
            }
            secondaryActions={
              <>
                <Button variant="link">Go to destination</Button>
                <Button variant="link">Configure Vaults</Button>
              </>
            }
          />
        )}
      </PageSection>
    </>
  );
};

export { Sources };
