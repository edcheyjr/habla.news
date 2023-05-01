import { useMemo } from "react";
import Link from "next/link";
import { useAtom } from "jotai";

import { nip19 } from "nostr-tools";
import {
  Flex,
  Text,
  Heading,
  Card,
  Stack,
  CardHeader,
  CardBody,
  Image,
} from "@chakra-ui/react";

import { relaysAtom } from "@habla/state";
import { getMetadata } from "@habla/nip23";
import { formatReadingTime, formatDay } from "@habla/format";
import useSeenOn from "@habla/hooks/useSeenOn";
import SeenIn from "@habla/components/SeenIn";
import User from "../User";
import Hashtags from "../../Hashtags";

function LongFormTitle({ title, content, publishedAt, updatedAt }) {
  return (
    <>
      <Heading fontSize="3xl">{title}</Heading>
      <LongFormTime
        publishedAt={publishedAt}
        updatedAt={updatedAt}
        content={content}
      />
    </>
  );
}

function LongFormTime({ content, publishedAt, updatedAt }) {
  const day = useMemo(() => formatDay(publishedAt), [publishedAt]);
  const updated = useMemo(() => {
    return formatDay(updatedAt);
  }, [publishedAt, updatedAt]);
  const readingTime = useMemo(() => formatReadingTime(content), [content]);
  return (
    <Flex alignItems="center" gap="2" color="secondary" fontSize="xs">
      <Text>
        {day}
        {updated != day && `, updated ${updated}`}
      </Text>
      {readingTime && (
        <>
          <Text>–</Text>
          <Text>{readingTime}</Text>
        </>
      )}
    </Flex>
  );
}

export default function LongFormNote({ event, excludeAuthor }) {
  const [defaultRelays] = useAtom(relaysAtom);
  const {
    identifier,
    title,
    image,
    summary,
    description,
    hashtags,
    publishedAt,
  } = useMemo(() => getMetadata(event), [event]);
  const relays = useSeenOn(event);
  const naddr = useMemo(() => {
    return nip19.naddrEncode({
      identifier,
      pubkey: event.pubkey,
      kind: event.kind,
      relays: relays.length > 0 ? relays : defaultRelays,
    });
  }, [event]);
  return (
    <Card variant="unstyled">
      {!excludeAuthor && (
        <CardHeader>
          <User pubkey={event.pubkey} size="xs" />
        </CardHeader>
      )}
      <CardBody>
        <Stack
          alignItems="flex-start"
          direction={["column", "row"]}
          spacing={6}
        >
          <Flex flexDirection="column" flexGrow="1" gap="1">
            <Link href={`/a/${naddr}`}>
              <LongFormTitle
                title={title}
                publishedAt={publishedAt}
                updatedAt={event.created_at}
                content={event.content}
              />
              {summary?.length > 0 && <Text py={1}>{summary}</Text>}
            </Link>
            {hashtags.length > 0 && (
              <Hashtags hashtags={hashtags.slice(0, 3)} />
            )}
          </Flex>
          {image?.length > 0 && summary?.length > 0 && (
            <Link href={`/a/${naddr}`}>
              <Image
                src={image}
                objectFit="contain"
                maxH="130px"
                maxW="200px"
                alt={title}
                display={["none", "block"]}
              />
            </Link>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
