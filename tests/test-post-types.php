<?php

/**
 * Tests that the custom post types and taxonomies register correctly.
 */
class Test_Post_Types extends WP_UnitTestCase
{
    public function test_meeting_post_types_are_registered()
    {
        $this->assertTrue(post_type_exists('tsml_meeting'));
        $this->assertTrue(post_type_exists('tsml_location'));
        $this->assertTrue(post_type_exists('tsml_group'));
    }

    public function test_taxonomies_are_registered()
    {
        $this->assertTrue(taxonomy_exists('tsml_region'));
        $this->assertTrue(taxonomy_exists('tsml_district'));
    }

    public function test_region_taxonomy_is_attached_to_locations()
    {
        $taxonomies = get_object_taxonomies('tsml_location');
        $this->assertContains('tsml_region', $taxonomies);
    }

    public function test_district_taxonomy_is_attached_to_groups()
    {
        $taxonomies = get_object_taxonomies('tsml_group');
        $this->assertContains('tsml_district', $taxonomies);
    }

    public function test_rest_route_is_registered()
    {
        $routes = rest_get_server()->get_routes();
        $this->assertArrayHasKey('/tsml/meetings', $routes);
    }
}
