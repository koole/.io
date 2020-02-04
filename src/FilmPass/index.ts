/**
 * @author alteredq / http://alteredqualia.com/
 */

import { FilmShader } from "./FilmShader.ts";
import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { UniformsUtils } from "three/build/three.module";
import { ShaderMaterial } from "three";

var FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	Pass.call( this );

	if ( FilmShader === undefined )
		console.error( "FilmPass relies on FilmShader" );

	var shader = FilmShader;

	this.uniforms = UniformsUtils.clone( shader.uniforms );

	this.material = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.fsQuad = new Pass.FullScreenQuad( this.material );

};

FilmPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: FilmPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "time" ].value += deltaTime;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

} );

export { FilmPass };
