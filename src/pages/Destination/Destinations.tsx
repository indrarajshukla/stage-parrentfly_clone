import * as React from "react";
import {
  Button,
  Card,
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
import { useNavigate } from "react-router-dom";
import EmptyStatus from "../../components/EmptyStatus";
import { Destination, fetchData } from "../../apis/apis";
import { API_URL } from "../../utils/constants";
import _, { debounce } from "lodash";
import { useQuery } from "react-query";
import SourceSinkTable from "../../components/SourceSinkTable";

const Destinations: React.FunctionComponent = () => {
  const navigate = useNavigate();

  const navigateTo = (url: string) => {
    navigate(url);
  };

  const [searchResult, setSearchResult] = React.useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const onClear = () => {
    onSearch?.("");
  };

  const {
    data: destinationsList = [],
    error,
    isLoading,
  } = useQuery<Destination[], Error>(
    "destinations",
    () => fetchData<Destination[]>(`${API_URL}/api/destinations`),
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
      const filteredSource = _.filter(destinationsList, function (o) {
        return o.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setSearchResult(filteredSource);
    }, 700),
    [destinationsList]
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
          <Text component="h1">Destination</Text>
          {destinationsList.length > 0 ? (
            <Text component="p">
              Add a destination to capture the change data event. To start
              select a connector below once you select a connector you can
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
        {destinationsList.length > 0 ? (
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
                    value={searchQuery}
                    placeholder="Find by name"
                    onChange={(_event, value) => onSearch(value)}
                    onClear={onClear}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <ToggleGroup aria-label="Icon variant toggle group">
                    <Button
                      variant="primary"
                      icon={<PlusIcon />}
                      onClick={() => navigateTo("/destination/catalog")}
                    >
                      Add destination
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
                        (searchQuery.length > 0
                          ? searchResult
                          : destinationsList
                        ).length
                      }
                      Items
                    </Text>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>

            <SourceSinkTable
              data={searchQuery.length > 0 ? searchResult : destinationsList}
              tableType="destination"
              onClear={onClear}
            />
          </Card>
        ) : (
          <EmptyStatus
            heading="No Destination available"
            primaryMessage=' No Destination is configure for this cluster yet. To capture the streaming change
              events from a source database you can configure a Destination by click
              the "Add Destination" button.'
            secondaryMessage="This text has overridden a css component variable to demonstrate
              how to apply customizations using PatternFly's global
              variable API."
            primaryAction={
              <Button
                variant="primary"
                icon={<PlusIcon />}
                onClick={() => navigateTo("/destination/catalog")}
              >
                Add destination
              </Button>
            }
            secondaryActions={
              <>
                <Button variant="link" onClick={() => navigateTo("/source")}>
                  Go to source
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigateTo("/transformation")}
                >
                  Add transformation
                </Button>
                <Button variant="link" onClick={() => navigateTo("/vaults")}>
                  Configure Vaults
                </Button>
              </>
            }
          />
        )}
      </PageSection>
    </>
  );
};

export { Destinations };
