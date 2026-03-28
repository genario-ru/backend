# Task

You are given {{CHANNEL_COUNT}} video channels from different platforms. Determine which channels belong to the same creator by comparing their names, descriptions, and recent video topics. Focus on content similarity, not identifiers.

# Channels

{{CHANNELS}}

# Instructions

- Group channels that clearly belong to the same creator into one group.
- If a channel's creator cannot be matched to another, it forms its own group.
- Every channel index (0-based) must appear in exactly one group.
- Return a JSON object with a "groups" field: an array of arrays of channel indices.

Example for 3 channels where 0 and 2 are the same creator, 1 is different:
{ "groups": [[0, 2], [1]] }
