<?php

/**
 * Tests for the REST feed endpoint in includes/rest.php.
 */
class RestApiTest extends WP_UnitTestCase
{
    public function test_restricted_feed_returns_403()
    {
        global $tsml_sharing;
        $previous = $tsml_sharing;
        $tsml_sharing = 'restricted';

        $request  = new WP_REST_Request('GET', '/tsml/meetings');
        $response = rest_do_request($request);

        $this->assertSame(403, $response->get_status());

        $tsml_sharing = $previous;
    }

    public function test_open_feed_returns_meetings_array()
    {
        global $tsml_sharing;
        $previous = $tsml_sharing;
        $tsml_sharing = 'open';

        $request  = new WP_REST_Request('GET', '/tsml/meetings');
        $response = rest_do_request($request);

        $this->assertSame(200, $response->get_status());
        $this->assertIsArray($response->get_data());

        $tsml_sharing = $previous;
    }

    public function test_valid_sharing_key_grants_access()
    {
        global $tsml_sharing, $tsml_sharing_keys;
        $previous_sharing = $tsml_sharing;
        $previous_keys    = $tsml_sharing_keys;
        $tsml_sharing      = 'restricted';
        $tsml_sharing_keys = ['secret123' => 'Partner Site'];

        $request = new WP_REST_Request('GET', '/tsml/meetings');
        $request->set_param('key', 'secret123');
        $response = rest_do_request($request);

        $this->assertSame(200, $response->get_status());

        $tsml_sharing      = $previous_sharing;
        $tsml_sharing_keys = $previous_keys;
    }
}
